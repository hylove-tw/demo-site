// src/config/sampleData.ts
//
// Bundled EEG samples so the demo can be tried without owning a headset.
//
// The CSVs are served from public/sample-data and turned into real File objects
// here, so loading a sample goes through exactly the same upload and parsing
// path as a user's own file. A separate "sample mode" would be a second code
// path that quietly stops matching the real one.
//
// Source: music-gen's sample_data/, two recorded scenarios each with a baseline
// (前測) and a post-intervention (後測) take.

export interface SampleScenario {
    id: string;
    name: string;
    description: string;
    /** What the numbers do, so the sample is instructive and not just filler. */
    effect: string;
    beforeUrl: string;
    afterUrl: string;
    beforeName: string;
    afterName: string;
}

export const SAMPLE_SCENARIOS: SampleScenario[] = [
    {
        id: '01_relaxation',
        name: '放鬆冥想',
        description: '基線（睜眼放鬆）與閉眼冥想後的對照',
        effect: 'Meditation 與 Theta 明顯上升、Attention 下降',
        beforeUrl: `${process.env.PUBLIC_URL}/sample-data/01_relaxation/before.csv`,
        afterUrl: `${process.env.PUBLIC_URL}/sample-data/01_relaxation/after.csv`,
        beforeName: '放鬆冥想_前測.csv',
        afterName: '放鬆冥想_後測.csv',
    },
    {
        id: '02_focus',
        name: '專注工作',
        description: '休息狀態與專注任務後的對照',
        effect: 'Attention 與 Beta 上升',
        beforeUrl: `${process.env.PUBLIC_URL}/sample-data/02_focus/before.csv`,
        afterUrl: `${process.env.PUBLIC_URL}/sample-data/02_focus/after.csv`,
        beforeName: '專注工作_前測.csv',
        afterName: '專注工作_後測.csv',
    },
];

async function fetchAsFile(url: string, fileName: string): Promise<File> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`無法載入範例資料（${res.status}）：${fileName}`);
    }
    const text = await res.text();
    return new File([text], fileName, { type: 'text/csv' });
}

/**
 * The scenario's two takes as File objects, ready for the normal upload path.
 *
 * Ordered before-then-after, which is the order the analysis expects its two
 * required files in.
 */
export async function loadSampleFiles(scenario: SampleScenario): Promise<File[]> {
    return Promise.all([
        fetchAsFile(scenario.beforeUrl, scenario.beforeName),
        fetchAsFile(scenario.afterUrl, scenario.afterName),
    ]);
}
