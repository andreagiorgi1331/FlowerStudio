import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { toPng } from 'html-to-image';

const API_URL = import.meta.env.VITE_API_URL;

function CreateBouquet() {
  const [availableFlowers, setAvailableFlowers] = useState([]);
  const [bouquetFlowers, setBouquetFlowers] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  // NUOVI STATI PER LA PERSONALIZZAZIONE
  const [bouquetName, setBouquetName] = useState('');
  const [wrapperColor, setWrapperColor] = useState('#FCEEF1');
  const [selectedRibbon, setSelectedRibbon] = useState('rosa');
  const [message, setMessage] = useState('');
  const bouquetAreaRef = useRef(null);

  // STATO PER TAB MOBILE (< 768px): 'catalog' | 'canvas' | 'customize'
  const [activeMobileTab, setActiveMobileTab] = useState('canvas');

  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const navigate = useNavigate();
  const location = useLocation();
  const templateIdea = location.state?.template;

  const touchStartRef = useRef(null);

  useEffect(() => {
    if (templateIdea) {
      setBouquetName(templateIdea.name + " (Personalizzato)");
      setWrapperColor(templateIdea.wrapper);
      setSelectedRibbon(templateIdea.ribbon);
      setBouquetFlowers(templateIdea.flowers);
    }
  }, [templateIdea]);

  useEffect(() => {
    if (editId) {
      const fetchEditData = async () => {
        try {
          const token = localStorage.getItem('flower_token');
          const response = await axios.get(`${API_URL}/bouquets/${editId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const data = response.data;
          setBouquetName(data.name);
          setWrapperColor(data.wrapper);
          setSelectedRibbon(data.ribbon);
          setBouquetFlowers(data.flowers); 
          
        } catch (error) {
          console.error("Errore caricamento per modifica", error);
          setMessage("Errore nel caricamento del bouquet.");
        }
      };
      fetchEditData();
    }
  }, [editId]);

  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // --- STATO FIOCCO SULLA CONFEZIONE ---
  const [hasRibbon, setHasRibbon] = useState(false);
  const [ribbonColor, setRibbonColor] = useState('#ff0000');

  useEffect(() => {
    const fetchFlowers = async () => {
      try {
        const response = await axios.get(`${API_URL}/flowers`);
        setAvailableFlowers(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Errore nel caricamento", err);
        setIsLoading(false);
      }
    };
    fetchFlowers();
  }, []);

  // --- FILTRO CATALOGO: FIORI vs FOGLIE ---
  const [catalogTab, setCatalogTab] = useState('flowers');
  const onlyFlowers = availableFlowers.filter(f => f.type !== 'leaf');
  const onlyLeaves = availableFlowers.filter(f => f.type === 'leaf');
  const displayedItems = catalogTab === 'flowers' ? onlyFlowers : onlyLeaves;

  // --- LOGICA TAP-TO-ADD (PER MOBILE & DESKTOP) ---
  const handleAddFlowerToCanvas = (flower) => {
    let centerX = 100;
    let centerY = 100;

    if (bouquetAreaRef.current) {
      const rect = bouquetAreaRef.current.getBoundingClientRect();
      centerX = Math.max(10, (rect.width / 2) - 60);
      centerY = Math.max(10, (rect.height / 2) - 60);
    }

    setBouquetFlowers((prev) => [
      ...prev,
      { ...flower, x: centerX, y: centerY, scale: 1, z_index: 10 }
    ]);
    
    // Passa alla scheda Canvas se ci troviamo in modalità mobile
    setActiveMobileTab('canvas');
  };

  // --- LOGICA DRAG & DROP DESKTOP ---
  const handleDragStartNew = (e, flower) => {
    e.dataTransfer.setData('new_flower_data', JSON.stringify(flower));
    const img = e.currentTarget.querySelector('img');
    if (img) {
      e.dataTransfer.setDragImage(img, 20, 20);
    }
  };

  const handleDragStartPlaced = (e, index) => {
    e.dataTransfer.setData('placed_flower_index', index.toString());
    
    const target = e.target;
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.top = '-2000px';
    wrapper.style.left = '-2000px';
    wrapper.style.width = target.offsetWidth + 'px';
    wrapper.style.height = target.offsetHeight + 'px';
    
    const ghost = target.cloneNode(true);
    ghost.style.position = 'relative';
    ghost.style.top = '0';
    ghost.style.left = '0';
    ghost.style.filter = 'none';
    
    wrapper.appendChild(ghost);
    document.body.appendChild(wrapper);
    
    e.dataTransfer.setDragImage(wrapper, target.offsetWidth / 2, target.offsetHeight / 2);
    
    setTimeout(() => {
      document.body.removeChild(wrapper);
    }, 10);
  };

  const handleDragOver = (e) => { e.preventDefault(); };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!bouquetAreaRef.current) return;
    const rect = bouquetAreaRef.current.getBoundingClientRect();
    const xRel = e.clientX - rect.left - 60; 
    const yRel = e.clientY - rect.top - 60;

    const newFlowerData = e.dataTransfer.getData('new_flower_data');
    const placedFlowerIndex = e.dataTransfer.getData('placed_flower_index');

    if (newFlowerData) {
      const flower = JSON.parse(newFlowerData);
      setBouquetFlowers((prev) => [...prev, { ...flower, x: xRel, y: yRel, scale: 1, z_index: 10 }]);
    } else if (placedFlowerIndex !== "") {
      const index = parseInt(placedFlowerIndex, 10);
      setBouquetFlowers((prev) => {
        const updatedFlowers = [...prev];
        updatedFlowers[index] = { ...updatedFlowers[index], x: xRel, y: yRel };
        return updatedFlowers;
      });
    }
  };

  // --- LOGICA TOUCH GESTURES (PER TOUCH DISPLAY MOBILE) ---
  const handleTouchStartFlower = (e, index) => {
    setSelectedItemIndex(index);
    const touch = e.touches[0];
    const flower = bouquetFlowers[index];
    touchStartRef.current = {
      index,
      startX: touch.clientX,
      startY: touch.clientY,
      initialX: flower.x,
      initialY: flower.y
    };
  };

  const handleTouchMoveFlower = (e) => {
    if (!touchStartRef.current || !bouquetAreaRef.current) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.startX;
    const deltaY = touch.clientY - touchStartRef.current.startY;
    const idx = touchStartRef.current.index;

    setBouquetFlowers(prev => prev.map((f, i) => i === idx ? {
      ...f,
      x: touchStartRef.current.initialX + deltaX,
      y: touchStartRef.current.initialY + deltaY
    } : f));
  };

  const handleTouchEndFlower = () => {
    touchStartRef.current = null;
  };

  const removeFlower = (indexToRemove) => {
    setBouquetFlowers(bouquetFlowers.filter((_, index) => index !== indexToRemove));
  };

  const handleClearCanvas = () => {
    setBouquetFlowers([]);
    setSelectedItemIndex(null);
    setMessage('Canvas svuotato.');
  };

  // --- FUNZIONE DI SALVATAGGIO ---
  const handleSave = async () => {
    if (bouquetFlowers.length === 0) {
      setMessage('Aggiungi almeno un fiore al bouquet!');
      return;
    }
    if (!bouquetName.trim()) {
      setMessage('Dai un nome alla tua creazione!');
      return;
    }

    try {
      const token = localStorage.getItem('flower_token');

      let base64Image = '';
      if (bouquetAreaRef.current) {
        const node = bouquetAreaRef.current;
        base64Image = await toPng(node, { 
          cacheBust: true,
          height: node.offsetHeight * 1.25,
          style: {
            overflow: 'visible'
          }
        });
      }

      const payload = {
        name: bouquetName,
        wrapper: wrapperColor,
        preview_image: base64Image,
        has_ribbon: hasRibbon,
        ribbon_color: ribbonColor,
        flowers: bouquetFlowers.map(f => ({ 
          id: f.id, x: f.x, y: f.y, scale: f.scale || 1, z_index: f.z_index || 10, is_flipped: f.is_flipped || false 
        }))
      };

      if (editId) {
        await axios.put(`${API_URL}/bouquets/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Bouquet aggiornato con successo!');
        setTimeout(() => navigate('/i-miei-mazzi'), 1500); 
        
      } else {
        await axios.post(`${API_URL}/bouquets`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Bouquet salvato nel tuo Giardino!');
      }
      
    } catch (error) {
      console.error(error);
      setMessage('Errore durante il salvataggio.');
    }
  };

  if (isLoading) return <h3 style={{ textAlign: 'center', marginTop: '2rem' }}>Caricamento in corso... </h3>;

  return (
    <div className="editor-layout">
      
      {/* ---------------------------------------------------- */}
      {/* COLONNA 1: CATALOGO FIORI (Sinistra) */}
      {/* ---------------------------------------------------- */}
      <div className={`editor-sidebar-left ${activeMobileTab !== 'catalog' ? 'mobile-hidden' : ''}`}>
        <div className="editor-header" style={{ flexDirection: 'column', gap: '10px', height: '115px', boxSizing: 'border-box' }}>
          <h3 style={{ margin: 0, color: '#4d6b53' }}>Catalogo</h3>
          <div style={{ display: 'flex', gap: '5px', width: '100%' }}>
            <button 
              onClick={() => setCatalogTab('flowers')}
              style={{ 
                flex: 1, padding: '8px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem',
                backgroundColor: catalogTab === 'flowers' ? '#4d6b53' : '#f0f0f0',
                color: catalogTab === 'flowers' ? '#fff' : '#888',
                minHeight: '44px', transition: 'all 0.2s'
              }}>
               Fiori
            </button>
            <button 
              onClick={() => setCatalogTab('leaves')}
              style={{ 
                flex: 1, padding: '8px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem',
                backgroundColor: catalogTab === 'leaves' ? '#4d6b53' : '#f0f0f0',
                color: catalogTab === 'leaves' ? '#fff' : '#888',
                minHeight: '44px', transition: 'all 0.2s'
              }}>
               Verde
            </button>
          </div>
        </div>
        
        <div className="flower-list" style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {displayedItems.map(flower => (
            <div 
              key={flower.id} 
              className="flower-item-card"
              draggable 
              onDragStart={(e) => handleDragStartNew(e, flower)}
              onClick={() => handleAddFlowerToCanvas(flower)}
              title="Clicca o trascina per aggiungere alla composizione"
              style={{ 
                display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', 
                border: '1px solid #eee', borderRadius: '12px', cursor: 'pointer', 
                backgroundColor: '#fff', transition: 'transform 0.15s, box-shadow 0.15s',
                minHeight: '54px'
              }}
            >
              <img src={`/fiori/${flower.name.toLowerCase()}.png`} alt={flower.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/869/869840.png'; }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#444' }}>{flower.name}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}> {flower.color}</p>
              </div>
              <span style={{ fontSize: '1.2rem', color: '#4d6b53', fontWeight: 'bold' }}>+</span>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* COLONNA 2: LA TELA CENTRALE (Centro) */}
      {/* ---------------------------------------------------- */}
      <div className={`editor-canvas ${activeMobileTab !== 'canvas' ? 'mobile-hidden' : ''}`}>
        
        {/* ACTION BAR FLUTTUANTE MOBILE */}
        <div className="mobile-floating-actions">
          <button 
            onClick={handleClearCanvas}
            className="mobile-action-btn"
            style={{ backgroundColor: '#fff', color: '#d32f2f' }}
          >
            🗑️ Svuota
          </button>
          <button 
            onClick={handleSave}
            className="mobile-action-btn"
            style={{ backgroundColor: '#4d6b53', color: '#fff' }}
          >
            💾 Salva
          </button>
        </div>

        <div className="editor-header" style={{ backgroundColor: '#fff', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: '10px', overflowX: 'auto', minHeight: '100px', boxSizing: 'border-box' }}>
          <div style={{ textAlign: 'left', marginRight: 'auto', flexShrink: 0 }}>
            <h3 style={{ margin: 0, color: '#4d6b53' }}>Composizione Bouquet</h3>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.85rem', color: '#888' }}>{bouquetFlowers.length} fiori · Colore Carta: {wrapperColor}</p>
          </div>

          {/* PANNELLO CONTROLLI FIORE SELEZIONATO */}
          {selectedItemIndex !== null && bouquetFlowers[selectedItemIndex] && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
              backgroundColor: '#f9f9f9', padding: '6px 12px', borderRadius: '12px', border: '1px solid #eaeaea',
              marginLeft: 'auto'
            }}>
              <span style={{ fontSize: '0.85rem', color: '#4d6b53', fontWeight: 'bold', paddingRight: '8px', borderRight: '1px solid #ddd' }}>
                {bouquetFlowers[selectedItemIndex].name}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {/* Slider Scala */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#888' }}>Scala</span>
                  <input 
                    type="range" min="0.5" max="2" step="0.1"
                    value={bouquetFlowers[selectedItemIndex].scale || 1}
                    onChange={(e) => {
                      const newScale = parseFloat(e.target.value);
                      setBouquetFlowers(prev => prev.map((f, i) => 
                        i === selectedItemIndex ? { ...f, scale: newScale } : f
                      ));
                    }}
                    style={{ width: '70px', accentColor: '#4d6b53', cursor: 'pointer', margin: 0 }}
                  />
                </div>

                {/* Level up / down */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button 
                    onClick={() => setBouquetFlowers(prev => prev.map((f, i) => 
                      i === selectedItemIndex ? { ...f, z_index: (parseInt(f.z_index) || 10) + 1 } : f
                    ))}
                    style={{ padding: '4px 8px', border: 'none', borderRadius: '4px', backgroundColor: '#eef2ee', color: '#4d6b53', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', minHeight: '36px' }}
                  >🔼 Su</button>
                  <button 
                    onClick={() => setBouquetFlowers(prev => prev.map((f, i) => 
                      i === selectedItemIndex ? { ...f, z_index: Math.max(1, (parseInt(f.z_index) || 10) - 1) } : f
                    ))}
                    style={{ padding: '4px 8px', border: 'none', borderRadius: '4px', backgroundColor: '#eef2ee', color: '#4d6b53', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', minHeight: '36px' }}
                  >🔽 Giù</button>
                </div>

                {/* Tasto Specchia */}
                <button 
                  onClick={() => setBouquetFlowers(prev => prev.map((f, i) => i === selectedItemIndex ? { ...f, is_flipped: !f.is_flipped } : f))}
                  style={{ 
                    padding: '4px 10px', border: '1px solid #ddd', borderRadius: '6px', 
                    backgroundColor: bouquetFlowers[selectedItemIndex].is_flipped ? '#EAF4A5' : '#fff', cursor: 'pointer', fontSize: '0.8rem',
                    fontWeight: 'bold', color: '#555', minHeight: '36px'
                  }}
                >
                  ↔️ Specchia
                </button>

                {/* Tasto Elimina */}
                <button 
                  onClick={() => { removeFlower(selectedItemIndex); setSelectedItemIndex(null); }}
                  style={{ 
                    padding: '4px 8px', border: 'none', borderRadius: '6px', 
                    backgroundColor: '#ffebee', color: '#d32f2f', cursor: 'pointer', fontSize: '0.8rem',
                    fontWeight: 'bold', minHeight: '36px'
                  }}
                >
                  🗑️ Rimuovi
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', position: 'relative' }}>
          {/* IL TAVOLO DA LAVORO */}
          <div 
            ref={bouquetAreaRef} 
            className="canvas-workspace"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => setSelectedItemIndex(null)}
            style={{ 
              position: 'relative', 
              borderRadius: '20px', 
              border: bouquetFlowers.length === 0 ? '3px dashed #ccc' : 'none'
            }}
          >
            {/* IMMAGINE DELLA CONFEZIONE AL CENTRO */}
            <div style={{ 
              position: 'absolute', bottom: '-12%', left: '50%', transform: 'translateX(-50%)', zIndex: 0,
              width: '120%', height: '80%', 
              backgroundColor: wrapperColor, 
              WebkitMaskImage: 'url(/confezioni/wrapper-base.svg)',
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'bottom center',
            }}>
              <img 
                src="/confezioni/wrapper-base.svg" 
                alt="Confezione" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom center', mixBlendMode: 'multiply' }} 
              />
            </div>          

            {/* LIVELLO FIOCCO */}
            {hasRibbon && (
              <div style={{ 
                position: 'absolute', bottom: '-25%', left: '50%', transform: 'translateX(-50%)', 
                zIndex: 35, 
                width: '40%', height: '40%', 
                backgroundColor: ribbonColor, 
                WebkitMaskImage: 'url(/confezioni/fiocco.svg)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'bottom center', 
                pointerEvents: 'none'
              }}>
               <img 
                  src="/confezioni/fiocco.svg" 
                  alt="Fiocco" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom center', mixBlendMode: 'multiply' }} 
                />
              </div>
            )}
            
            {bouquetFlowers.length === 0 && (
              <p style={{ color: '#888', position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: '100%', textAlign: 'center', pointerEvents: 'none', zIndex: 40, padding: '0 15px' }}>
                Trascina o tocca i fiori nel Catalogo per comporre
              </p>
            )}

            {/* I FIORI TRASCINATI */}
            {bouquetFlowers.map((flower, index) => {
              const flowerZIndex = flower.z_index != null ? parseInt(flower.z_index) : (flower.type === 'leaf' ? 5 + index : 20 + index);
              const flowerScale = parseFloat(flower.scale) || 1;
              return (
              <img 
                key={index}
                src={`/fiori/${flower.name.toLowerCase()}.png`} 
                alt={flower.name}
                draggable 
                onDragStart={(e) => handleDragStartPlaced(e, index)}
                onTouchStart={(e) => handleTouchStartFlower(e, index)}
                onTouchMove={handleTouchMoveFlower}
                onTouchEnd={handleTouchEndFlower}
                onDoubleClick={() => { removeFlower(index); setSelectedItemIndex(null); }}
                onClick={(e) => { e.stopPropagation(); setSelectedItemIndex(index); }}
                style={{ 
                  position: 'absolute', 
                  left: `${flower.x}px`, 
                  top: `${flower.y}px`, 
                  width: '110px', height: '110px', 
                  objectFit: 'contain', cursor: 'grab', 
                  transform: `scale(${flowerScale}) scaleX(${flower.is_flipped ? -1 : 1})`,
                  transformOrigin: 'center center',
                  zIndex: flowerZIndex,
                  filter: selectedItemIndex === index ? 'drop-shadow(0 0 8px rgba(77,107,83,0.9))' : 'none',
                  transition: 'filter 0.15s, transform 0.15s',
                  touchAction: 'none'
                }}
                onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/869/869840.png'; }}
              />
            );
            })}

            {/* LIVELLO FRONTALE DELLA CONFEZIONE */}
            <div style={{ 
              position: 'absolute', bottom: '-17%', left: '50%', transform: 'translateX(-50%)', 
              zIndex: 30, 
              width: '100%', height: '69%', 
              backgroundColor: wrapperColor, 
              WebkitMaskImage: 'url(/confezioni/wrapper-sovrapposto.svg)',
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'bottom center',
              pointerEvents: 'none'
            }}>
              <img 
                src="/confezioni/wrapper-sovrapposto.svg" 
                alt="Confezione Fronte" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom center', mixBlendMode: 'multiply' }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* COLONNA 3: PERSONALIZZAZIONE E SALVATAGGIO (Destra) */}
      {/* ---------------------------------------------------- */}
      <div className={`editor-sidebar-right ${activeMobileTab !== 'customize' ? 'mobile-hidden' : ''}`} style={{ transition: 'width 0.3s, min-width 0.3s', width: sidebarOpen ? undefined : '50px', minWidth: sidebarOpen ? undefined : '50px', overflow: 'hidden' }}>
        <div className="editor-header" style={{ cursor: 'pointer', justifyContent: 'space-between', height: '100px', boxSizing: 'border-box' }} onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen && <h3 style={{ margin: 0, color: '#4d6b53' }}>Personalizzazione</h3>}
          <span style={{ fontSize: '1.2rem', color: '#4d6b53' }}>{sidebarOpen ? '▶' : '◀'}</span>
        </div>

        {sidebarOpen && (
          <>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* 1. Nome del Bouquet */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: '#555', marginBottom: '8px', fontWeight: 'bold' }}>Nome Bouquet</label>
            <input 
              type="text" 
              placeholder="Es. Romantico Tramonto" 
              value={bouquetName}
              maxLength={25}
              onChange={(e) => setBouquetName(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', boxSizing: 'border-box', minHeight: '44px' }}
            />
          </div>

          {/* 2. Scelta Colore Confezione */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: '#555', marginBottom: '8px', fontWeight: 'bold' }}>Colore Confezione</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '12px', border: '1px solid #eee' }}>
              
              <input 
                type="color" 
                value={wrapperColor}
                onChange={(e) => setWrapperColor(e.target.value)}
                style={{ 
                  width: '50px', height: '50px', padding: '0', border: 'none', borderRadius: '8px', cursor: 'pointer',
                  backgroundColor: 'transparent'
                }}
              />
              
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#555' }}>Scegli la sfumatura</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>HEX: {wrapperColor}</p>
              </div>
            </div>
          </div>

          {/* 3. Personalizzazione Fiocco */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: '#555', marginBottom: '8px', fontWeight: 'bold' }}>Fiocco Confezione</label>
            <div style={{ backgroundColor: '#fdfbf7', padding: '15px', borderRadius: '12px', border: '1px solid #eee' }}>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: hasRibbon ? '15px' : '0', minHeight: '44px' }}>
                <input 
                  type="checkbox" 
                  checked={hasRibbon} 
                  onChange={(e) => setHasRibbon(e.target.checked)}
                  style={{ width: '22px', height: '22px', accentColor: '#4d6b53', cursor: 'pointer' }}
                />
                <span style={{ color: '#4d6b53', fontWeight: 'bold', fontSize: '0.95rem' }}>Aggiungi Fiocco</span>
              </label>

              {hasRibbon && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', paddingTop: '15px', borderTop: '1px solid #eaeaea' }}>
                  <input 
                    type="color" 
                    value={ribbonColor}
                    onChange={(e) => setRibbonColor(e.target.value)}
                    style={{ 
                      width: '44px', height: '44px', padding: '0', border: 'none', borderRadius: '8px', cursor: 'pointer',
                      backgroundColor: 'transparent'
                    }}
                  />
                  <div>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#555', fontSize: '0.85rem' }}>Colore Fiocco</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>{ribbonColor}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Messaggio di successo/errore */}
        {message && (
          <div style={{ padding: '0 1.2rem', color: message.includes('successo') || message.includes('salvato') ? '#4CAF50' : '#D32F2F', fontWeight: 'bold', textAlign: 'center' }}>
            {message}
          </div>
        )}

        {/* Bottone di Salvataggio */}
        <div style={{ padding: '1.2rem', borderTop: '1px solid #eaeaea', backgroundColor: '#fff' }}>
          <button 
            onClick={handleSave} 
            style={{ 
              width: '100%', padding: '14px', backgroundColor: '#4d6b53', color: 'white', 
              border: 'none', borderRadius: '8px', fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer', 
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', minHeight: '48px'
            }}>
            💾 Salva Bouquet
          </button>
        </div>
          </>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* BARRA TAB BOTTOM NAVIGATION PER DISPOSITIVI MOBILE   */}
      {/* ---------------------------------------------------- */}
      <nav className="mobile-tabs-nav">
        <button 
          className={`mobile-tab-btn ${activeMobileTab === 'catalog' ? 'active' : ''}`}
          onClick={() => setActiveMobileTab('catalog')}
        >
          <span className="mobile-tab-btn-icon">🌸</span>
          Catalogo
        </button>
        <button 
          className={`mobile-tab-btn ${activeMobileTab === 'canvas' ? 'active' : ''}`}
          onClick={() => setActiveMobileTab('canvas')}
        >
          <span className="mobile-tab-btn-icon">🎨</span>
          Composizione
        </button>
        <button 
          className={`mobile-tab-btn ${activeMobileTab === 'customize' ? 'active' : ''}`}
          onClick={() => setActiveMobileTab('customize')}
        >
          <span className="mobile-tab-btn-icon">🎀</span>
          Personalizza
        </button>
      </nav>

    </div>
  );
}

export default CreateBouquet;