const { OpenAI } = require('openai');
const FlowerModel = require('../models/flowerModel'); // Il nostro lavoratore dei fiori
const BouquetModel = require('../models/bouquetModel'); 
require('dotenv').config();

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1" 
});

const ChatService = {
    askAI: async (userMessage, user) => {
        try {
            // 1. Definiamo la personalità (Usiamo "Fleur" scritto normale)
            const systemPrompt = user.role === 'admin' 
                ? "Sei l'assistente gestionale segreto di FlowerStudio. Hai accesso al database, usa SEMPRE lo strumento per rispondere alle domande sui fiori."
                : `Sei ${process.env.BOT_NAME}, l'esperta Floral Designer virtuale di FlowerStudio. 
                   Usa SEMPRE lo strumento get_flower_catalog per leggere il catalogo reale prima di consigliare fiori all'utente.
                   Aiuta l'utente a creare bouquet bilanciati suggerendo SOLO i fiori che vedi nel database.`;

            // 2. Lo Strumento (Semplificato per farlo digerire meglio all'AI)
            const tools = [
                {
                    type: "function",
                    function: {
                        name: "get_flower_catalog",
                        description: "Ottiene il catalogo completo dei fiori disponibili nel negozio dal database PostgreSQL.",
                        parameters: { 
                            type: "object", 
                            properties: {}, 
                            additionalProperties: false 
                        }
                    },
                    
                }, 
                {
                    type: "function",
                    function: {
                        name: "get_store_statistics",
                        description: "Ottiene le statistiche di vendita del negozio (solo per Admin): numero totale di bouquet e fiori più usati.",
                        parameters: { type: "object", properties: {}, additionalProperties: false }
                    }
                },
                {
                    type: "function",
                    function: {
                        name: "get_templates_by_event",
                        description: "Cerca nel database i bouquet predefiniti (template) adatti a un evento o stile specifico (es. 'Matrimonio', 'Laurea', 'Romantico').",
                        parameters: { 
                            type: "object", 
                            properties: {
                                event: {
                                    type: "string",
                                    description: "L'evento o lo stile richiesto dall'utente (es. matrimonio, laurea, compleanno)."
                                }
                            }, 
                            required: ["event"],
                            additionalProperties: false 
                        }
                    }
                }
            ];

            const messages = [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ];

            // 3. Prima chiamata usando il modello 70B (il fratello maggiore super intelligente!)
            const response = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile", // <--- IL NUOVO MOTORE
                messages: messages,
                tools: tools,
                tool_choice: "auto" 
            });

            const responseMessage = response.choices[0].message;

            // 4. L'AI ha deciso di usare lo strumento?
            if (responseMessage.tool_calls) {
                messages.push(responseMessage);

                for (const toolCall of responseMessage.tool_calls) {
                    // STRUMENTO 1: Catalogo Fiori
                    if (toolCall.function.name === "get_flower_catalog") {
                        console.log(" Fleur sta leggendo il catalogo...");
                        const flowersFromDB = await FlowerModel.getAllFlowers();
                        messages.push({
                            tool_call_id: toolCall.id,
                            role: "tool",
                            name: "get_flower_catalog",
                            content: JSON.stringify(flowersFromDB)
                        });
                    }

                    // STRUMENTO 2: Statistiche Admin
                    if (toolCall.function.name === "get_store_statistics") {
                        console.log(" L'AI sta calcolando le statistiche...");
                        
                        // SICUREZZA: Controlliamo che l'utente sia davvero un admin!
                        if (user.role !== 'admin') {
                            messages.push({
                                tool_call_id: toolCall.id,
                                role: "tool",
                                name: "get_store_statistics",
                                content: JSON.stringify({ error: "Accesso Negato. L'utente non è un amministratore." })
                            });
                        } else {
                            // Se è admin, procediamo con la query!
                            const stats = await BouquetModel.getStoreStats();
                            messages.push({
                                tool_call_id: toolCall.id,
                                role: "tool",
                                name: "get_store_statistics",
                                content: JSON.stringify(stats)
                            });
                        }
                    }
                    // STRUMENTO 3: Suggeritore di Template
                    if (toolCall.function.name === "get_templates_by_event") {
                        console.log(" Fleur sta cercando i template...");
                        
                        // A differenza degli altri, qui dobbiamo LEGGERE l'argomento (la parola chiave)
                        // che l'Intelligenza Artificiale ha deciso di cercare!
                        const args = JSON.parse(toolCall.function.arguments);
                        const eventStyle = args.event;
                        
                        let templates = [];
                        if (BouquetModel.getBouquetsByStyle) {
                            templates = await BouquetModel.getBouquetsByStyle(eventStyle);
                        } else {
                            templates = [{ errore: "Ricerca template non disponibile." }];
                        }
                        
                        messages.push({
                            tool_call_id: toolCall.id,
                            role: "tool",
                            name: "get_templates_by_event",
                            content: JSON.stringify(templates)
                        });
                    }
                }

                // 5. Seconda chiamata: Fleur ora ha i dati e risponde!
                const secondResponse = await groq.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages: messages
                });

                return secondResponse.choices[0].message.content;
            }

            return responseMessage.content;
            
        } catch (error) {
            console.error(' ERRORE REALE DI GROQ:', error.message);
            throw new Error(`Errore AI: ${error.message}`);
        }
    }
};

module.exports = ChatService;