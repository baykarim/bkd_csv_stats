import * as fs from "fs";
import * as path from "path";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
// --- Lecture des arguments ---
const args = process.argv.slice(2);
if (args.length < 1) {
    console.error("Usage: node dist/index.js <fichier CSV>");
    process.exit(1);
}
const csvFile = args[0];
if (!fs.existsSync(csvFile)) {
    console.error(`Le fichier "${csvFile}" n'existe pas`);
    process.exit(1);
}
// --- Lecture du CSV ---
const rawData = fs.readFileSync(csvFile, "utf-8");
const rows = rawData.trim().split("\n").map(line => line.split(","));
// Supposons CSV avec entêtes : name,value
const headers = rows[0];
const dataRows = rows.slice(1);
// Extraction des valeurs numériques
const names = [];
const values = [];
for (const [name, val] of dataRows) {
    names.push(name);
    values.push(Number(val));
}
// --- Calcul statistiques ---
const somme = values.reduce((a, b) => a + b, 0);
const moyenne = somme / values.length;
const min = Math.min(...values);
const max = Math.max(...values);
console.log(`📊 Nombre de lignes : ${values.length}`);
console.log(`💰 Somme : ${somme}`);
console.log(`📈 Moyenne : ${moyenne}`);
console.log(`🔽 Min : ${min}`);
console.log(`🔼 Max : ${max}`);
// --- Histogramme texte ---
console.log("\n📊 Histogramme :");
const maxBarLength = 20;
const maxValue = Math.max(...values);
for (let i = 0; i < values.length; i++) {
    const barLength = Math.round((values[i] / maxValue) * maxBarLength);
    const bar = "█".repeat(barLength);
    console.log(`${names[i].padEnd(10)} | ${bar} ${values[i]}`);
}
// --- Histogramme PNG avec chart.js ---
const width = 800;
const height = 600;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
const configuration = {
    type: "bar",
    data: {
        labels: names,
        datasets: [
            {
                label: "Valeurs CSV",
                data: values,
                backgroundColor: "rgba(54, 162, 235, 0.6)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1
            }
        ]
    },
    options: {
        scales: {
            y: { beginAtZero: true }
        },
        plugins: {
            title: { display: true, text: "Histogramme des valeurs CSV" }
        }
    }
};
(async () => {
    const image = await chartJSNodeCanvas.renderToBuffer(configuration);
    const outFile = path.join(process.cwd(), "histogramme.png");
    fs.writeFileSync(outFile, image);
    console.log(`\n✅ Histogramme PNG généré : ${outFile}`);
})();
