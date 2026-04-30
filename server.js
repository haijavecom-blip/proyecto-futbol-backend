import express from "express";
import fetch from "node-fetch";
import OpenAI from "openai";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// IA de OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY
});

// Ruta: obtener partidos reales del día
app.get("/partidos", async (req, res) => {
    try {
        const hoy = new Date().toISOString().split("T")[0];

        const datos = await fetch(
            `https://v3.football.api-sports.io/fixtures?date=${hoy}`,
            {
                headers: {
                    "x-apisports-key": process.env.FOOTBALL_KEY
                }
            }
        ).then(r => r.json());

        const partidos = datos.response.map(p => ({
            id: p.fixture.id,
            fecha: p.fixture.date,
            estadio: p.fixture.venue.name,
            local: p.teams.home.name,
            visitante: p.teams.away.name,
            logoLocal: p.teams.home.logo,
            logoVisitante: p.teams.away.logo,
            golesLocal: p.goals.home,
            golesVisitante: p.goals.away,
            liga: p.league.name,
            pais: p.league.country
        }));

        res.json(partidos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error obteniendo partidos" });
    }
});

// Ruta: IA para responder preguntas
app.post("/ia", async (req, res) => {
    try {
        const pregunta = req.body.pregunta;

        const respuesta = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Eres una IA experta en fútbol." },
                { role: "user", content: pregunta }
            ]
        });

        res.json({
            respuesta: respuesta.choices[0].message.content
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en la IA" });
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Servidor funcionando en puerto " + PORT);
});
