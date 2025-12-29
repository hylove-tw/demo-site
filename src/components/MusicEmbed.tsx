// src/components/MusicEmbed.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import AudioPlayer from 'osmd-audio-player';

interface MusicEmbedProps {
    musicXML: string;
    height?: string;
}

const ZOOM_OPTIONS = [
    { value: 0.3, label: '30%' },
    { value: 0.4, label: '40%' },
    { value: 0.5, label: '50%' },
    { value: 0.6, label: '60%' },
    { value: 0.7, label: '70%' },
    { value: 0.8, label: '80%' },
    { value: 1.0, label: '100%' },
];

const DEFAULT_ZOOM = 0.7;

const MusicEmbed: React.FC<MusicEmbedProps> = ({ musicXML, height = '500px' }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const osmdRef = useRef<OSMD | null>(null);
    const audioPlayerRef = useRef<AudioPlayer | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState<string>('music');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isAudioReady, setIsAudioReady] = useState(false);
    const [zoom, setZoom] = useState(DEFAULT_ZOOM);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingProgress, setRecordingProgress] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    // 追蹤上一次的 musicXML，用於判斷是否需要重新載入
    const prevMusicXMLRef = useRef<string | null>(null);

    // 載入並渲染 OSMD
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !musicXML) return;

        const loadAndRender = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // 解析 musicXML 取得標題
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(musicXML, 'text/xml');
                const titleElems = xmlDoc.getElementsByTagName('movement-title');
                const workTitle = xmlDoc.getElementsByTagName('work-title');
                const currentTitle =
                    (titleElems.length > 0 ? titleElems[0].textContent : null) ||
                    (workTitle.length > 0 ? workTitle[0].textContent : null) ||
                    'music';
                setTitle(currentTitle);

                // 判斷是否需要重新建立 OSMD 實例
                const needNewInstance = !osmdRef.current || prevMusicXMLRef.current === null;

                if (needNewInstance) {
                    // 清除之前的內容
                    container.innerHTML = '';

                    // 停止之前的播放
                    if (audioPlayerRef.current) {
                        audioPlayerRef.current.stop();
                        audioPlayerRef.current = null;
                    }
                    setIsAudioReady(false);

                    // 建立新的 OSMD 實例
                    osmdRef.current = new OSMD(container, {
                        autoResize: true,
                        drawTitle: true,
                        drawSubtitle: true,
                        drawComposer: true,
                        drawCredits: true,
                        drawPartNames: true,
                        followCursor: true,
                        drawingParameters: 'compact',
                    });
                } else {
                    // 重用現有實例，停止播放
                    if (audioPlayerRef.current) {
                        audioPlayerRef.current.stop();
                    }
                    setIsAudioReady(false);
                }

                // 載入 MusicXML (此時 osmdRef.current 一定存在)
                const osmd = osmdRef.current!;
                await osmd.load(musicXML);
                prevMusicXMLRef.current = musicXML;

                // 設定縮放比例
                osmd.zoom = zoom;

                // 渲染樂譜
                osmd.render();

                // 初始化音樂播放器
                try {
                    audioPlayerRef.current = new AudioPlayer();
                    await audioPlayerRef.current.loadScore(osmdRef.current as any);
                    setIsAudioReady(true);
                } catch (audioErr) {
                    console.warn('Audio player initialization failed:', audioErr);
                }

                setIsLoading(false);
            } catch (err) {
                console.error('Error loading musicXML:', err);
                setError(err instanceof Error ? err.message : '載入樂譜失敗');
                setIsLoading(false);
            }
        };

        loadAndRender();

        // Cleanup only on unmount
        return () => {
            if (audioPlayerRef.current) {
                try {
                    audioPlayerRef.current.stop();
                } catch (e) {
                    // Ignore cleanup errors
                }
                audioPlayerRef.current = null;
            }
            osmdRef.current = null;
            prevMusicXMLRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [musicXML]);

    // 單獨處理縮放變更（不重新載入 XML）
    useEffect(() => {
        if (osmdRef.current && prevMusicXMLRef.current) {
            osmdRef.current.zoom = zoom;
            osmdRef.current.render();
        }
    }, [zoom]);

    // 縮放控制
    const handleZoomChange = useCallback((newZoom: number) => {
        setZoom(newZoom);
    }, []);

    // 播放控制
    const handlePlay = useCallback(async () => {
        if (!audioPlayerRef.current || !isAudioReady) return;

        try {
            if (isPaused) {
                audioPlayerRef.current.play();
            } else {
                audioPlayerRef.current.play();
            }
            setIsPlaying(true);
            setIsPaused(false);
        } catch (err) {
            console.error('Play error:', err);
        }
    }, [isAudioReady, isPaused]);

    const handlePause = useCallback(() => {
        if (!audioPlayerRef.current) return;
        audioPlayerRef.current.pause();
        setIsPlaying(false);
        setIsPaused(true);
    }, []);

    const handleStop = useCallback(() => {
        if (!audioPlayerRef.current) return;
        audioPlayerRef.current.stop();
        setIsPlaying(false);
        setIsPaused(false);
    }, []);

    // 下載 MusicXML 檔案
    const downloadMusicXML = useCallback(() => {
        const blob = new Blob([musicXML], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.xml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [musicXML, title]);

    // 下載 MP3 檔案（錄製播放音樂）
    const downloadMP3 = useCallback(async () => {
        if (!audioPlayerRef.current || !isAudioReady || isRecording) return;

        try {
            // 取得 AudioContext（osmd-audio-player 內部使用）
            const audioPlayer = audioPlayerRef.current as any;
            const audioContext: AudioContext = audioPlayer.ac || audioPlayer.audioContext;

            if (!audioContext) {
                alert('無法存取音樂上下文');
                return;
            }

            // 建立 MediaStreamDestination 用於錄製
            const dest = audioContext.createMediaStreamDestination();

            // 連接音樂輸出到錄製目標
            // 注意：這會將所有音樂都導向錄製
            if (audioContext.destination) {
                // 嘗試取得 gain node 或直接連接
                const gainNode = audioPlayer.gainNode || audioPlayer.masterGain;
                if (gainNode) {
                    gainNode.connect(dest);
                }
            }

            // 設定 MediaRecorder
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';

            mediaRecorderRef.current = new MediaRecorder(dest.stream, { mimeType });
            recordedChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                // 建立下載
                const blob = new Blob(recordedChunksRef.current, { type: mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                // 使用 .webm 副檔名（因為瀏覽器原生不支援 MP3 編碼）
                a.download = `${title}.webm`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                // 清理
                setIsRecording(false);
                setRecordingProgress(0);

                // 斷開錄製連接
                const gainNode = audioPlayer.gainNode || audioPlayer.masterGain;
                if (gainNode) {
                    try {
                        gainNode.disconnect(dest);
                    } catch (e) {
                        // 忽略斷開錯誤
                    }
                }
            };

            // 開始錄製
            setIsRecording(true);
            mediaRecorderRef.current.start(100); // 每 100ms 收集一次數據

            // 停止當前播放並重新開始
            audioPlayerRef.current.stop();

            // 監聽播放結束
            const checkPlaybackEnd = setInterval(() => {
                const player = audioPlayerRef.current as any;
                if (player) {
                    const currentTime = player.currentTime || 0;
                    const duration = player.duration || 1;
                    setRecordingProgress(Math.min((currentTime / duration) * 100, 100));

                    // 檢查是否播放結束
                    if (player.state === 'STOPPED' || player.state === 'PAUSED' || currentTime >= duration) {
                        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                            // 等待一小段時間確保所有音樂都被錄製
                            setTimeout(() => {
                                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                                    mediaRecorderRef.current.stop();
                                }
                            }, 500);
                            clearInterval(checkPlaybackEnd);
                        }
                    }
                }
            }, 200);

            // 開始播放
            audioPlayerRef.current.play();
            setIsPlaying(true);
            setIsPaused(false);

        } catch (err) {
            console.error('錄製錯誤:', err);
            alert('錄製失敗：' + (err instanceof Error ? err.message : '未知錯誤'));
            setIsRecording(false);
        }
    }, [isAudioReady, isRecording, title]);

    // 停止錄製
    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        if (audioPlayerRef.current) {
            audioPlayerRef.current.stop();
        }
        setIsPlaying(false);
        setIsPaused(false);
    }, []);

    // 列印樂譜 - 開啟新視窗只印樂譜
    const printScore = useCallback(() => {
        if (!containerRef.current) return;

        // 取得樂譜 SVG 內容
        const svgElements = containerRef.current.querySelectorAll('svg');
        if (svgElements.length === 0) {
            alert('找不到樂譜內容');
            return;
        }

        // 建立列印視窗
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (!printWindow) {
            alert('無法開啟列印視窗，請檢查彈出視窗設定');
            return;
        }

        // 複製所有 SVG 並調整尺寸
        let svgContent = '';
        svgElements.forEach((svg) => {
            const clonedSvg = svg.cloneNode(true) as SVGElement;
            // 設定列印尺寸
            clonedSvg.setAttribute('width', '100%');
            clonedSvg.removeAttribute('height');
            clonedSvg.style.maxWidth = '100%';
            clonedSvg.style.height = 'auto';
            svgContent += clonedSvg.outerHTML;
        });

        // 寫入列印頁面
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${title} - 樂譜列印</title>
                <style>
                    @page {
                        size: A4;
                        margin: 15mm;
                    }
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        background: white;
                        padding: 10mm;
                    }
                    h1 {
                        text-align: center;
                        font-size: 18pt;
                        margin-bottom: 10mm;
                        color: #333;
                    }
                    .score-container {
                        width: 100%;
                    }
                    .score-container svg {
                        width: 100% !important;
                        height: auto !important;
                        max-width: 100%;
                        display: block;
                        margin: 0 auto;
                        page-break-inside: avoid;
                    }
                    @media print {
                        body {
                            padding: 0;
                        }
                        .no-print {
                            display: none !important;
                        }
                    }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <div class="score-container">
                    ${svgContent}
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                            window.close();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }, [title]);

    return (
        <div className="music-embed-container">
            {/* 播放控制列 - 永遠顯示在最上方 */}
            <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-base-200 rounded-lg">
                    {/* 播放控制 */}
                    <div className="flex items-center gap-1">
                        {!isPlaying ? (
                            <button
                                onClick={handlePlay}
                                disabled={isLoading || !isAudioReady}
                                className="btn btn-primary btn-sm"
                                title="播放"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                                </svg>
                                播放
                            </button>
                        ) : (
                            <button
                                onClick={handlePause}
                                className="btn btn-secondary btn-sm"
                                title="暫停"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" />
                                </svg>
                                暫停
                            </button>
                        )}
                        <button
                            onClick={handleStop}
                            disabled={isLoading || (!isPlaying && !isPaused)}
                            className="btn btn-ghost btn-sm"
                            title="停止"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    <div className="divider divider-horizontal mx-1"></div>

                    {/* 縮放控制 */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted">縮放:</span>
                        <select
                            value={zoom}
                            onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                            disabled={isLoading}
                            className="select select-bordered select-xs"
                        >
                            {ZOOM_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="divider divider-horizontal mx-1"></div>

                    {/* 下載與列印 */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={downloadMusicXML}
                            disabled={isLoading}
                            className="btn btn-outline btn-sm"
                            title="下載 MusicXML（可匯入 MuseScore）"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            XML
                        </button>
                        {isRecording ? (
                            <button
                                onClick={stopRecording}
                                className="btn btn-error btn-sm"
                                title="停止錄製"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
                                </svg>
                                {recordingProgress > 0 ? `${Math.round(recordingProgress)}%` : '停止'}
                            </button>
                        ) : (
                            <button
                                onClick={downloadMP3}
                                disabled={isLoading || !isAudioReady}
                                className="btn btn-outline btn-sm"
                                title="錄製並下載音樂"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                                </svg>
                                音樂下載
                            </button>
                        )}
                        <button
                            onClick={printScore}
                            disabled={isLoading}
                            className="btn btn-outline btn-sm"
                            title="列印樂譜"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                            </svg>
                            列印
                        </button>
                    </div>

                    {/* 狀態提示 */}
                    <span className="text-xs text-text-muted ml-auto">
                        {isLoading ? '載入中...' : !isAudioReady ? '(音樂載入中...)' : ''}
                    </span>
                </div>

            {/* 錯誤提示 */}
            {error && (
                <div className="alert alert-error mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>樂譜載入失敗：{error}</span>
                </div>
            )}

            {/* 樂譜顯示區 - 使用包裝層避免 React 與 OSMD 的 DOM 衝突 */}
            <div className="relative" style={{ minHeight: height, maxHeight: '800px' }}>
                {/* 載入中覆蓋層 - 放在 OSMD 容器外部 */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-lg">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                )}
                {/* OSMD 專用容器 - 不包含任何 React 子元素 */}
                <div
                    ref={containerRef}
                    className="overflow-auto bg-white rounded-lg p-4"
                    style={{ minHeight: height, maxHeight: '800px' }}
                />
            </div>
        </div>
    );
};

export default MusicEmbed;
