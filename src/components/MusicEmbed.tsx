// src/components/MusicEmbed.tsx
import React, {useEffect, useRef} from 'react';
import Embed from 'flat-embed';
import MidiConverter from "../utils/midiConverter";

interface MusicEmbedProps {
    musicXML: string;
    height?: string;
}

const MusicEmbed: React.FC<MusicEmbedProps> = ({musicXML, height = '500px'}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const embedRef = useRef<any>(null);
    const exportMidiRef = useRef<HTMLAnchorElement>(null);
    const exportWavRef = useRef<HTMLAnchorElement>(null);
    const exportMp3Ref = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            console.log(process.env.REACT_APP_MUSIC_APP_ID)
            // 初始化 flat-embed 實例
            embedRef.current = new Embed(containerRef.current, {
                height,
                embedParams: {
                    appId: process.env.REACT_APP_MUSIC_APP_ID, // 請在 .env 中設定 REACT_APP_MUSIC_APP_ID
                    layout: 'page',
                    branding: false,
                    controlsFullscreen: false,
                },
            });
            // 載入 musicXML，成功後執行 doAudioConvert
            embedRef.current.loadMusicXML(musicXML)
                .then(() => {
                    doAudioConvert();
                })
                .catch((error: any) => {
                    console.error('Error loading musicXML:', error);
                });
        }
    }, [musicXML, height]);

    // 整合音樂下載功能：解析 musicXML 取得標題，再利用 flat-embed 取得 MIDI，更新各下載連結
    const doAudioConvert = () => {
        if (!embedRef.current) return;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(musicXML, "text/xml");
        const titleElems = xmlDoc.getElementsByTagName("movement-title");
        const currentTitle = titleElems.length > 0 ? titleElems[0].textContent || "music" : "music";

        embedRef.current.getMIDI().then((midi: any) => {
            const mc = new MidiConverter(midi);

            // convert to MIDI
            const midiBlob = mc.convertToMidiBlob();
            if (midiBlob && exportMidiRef.current) {
                exportMidiRef.current.href = URL.createObjectURL(midiBlob);
                exportMidiRef.current.download = currentTitle + ".mid";
            } else {
                console.error("MIDI Blob 未生成");
            }

            // convert to WAV
            const wavBlob = mc.convertToWavBlob();
            if (wavBlob && exportWavRef.current) {
                exportWavRef.current.href = URL.createObjectURL(wavBlob);
                exportWavRef.current.download = currentTitle + ".wav";
            } else {
                console.error("WAV Blob 未生成");
            }

            // convert to MP3 (此範例與 WAV 相同，依需求修改)
            const mp3Blob = mc.convertToWavBlob();
            if (mp3Blob && exportMp3Ref.current) {
                exportMp3Ref.current.href = URL.createObjectURL(mp3Blob);
                exportMp3Ref.current.download = currentTitle + ".mp3";
            } else {
                console.error("MP3 Blob 未生成");
            }
        }).catch((err: any) => {
            console.error("Error converting audio: ", err);
        });
    };


    return (
        <div>
            {/* 嵌入展示區 */}
            <div id="embed-example" ref={containerRef} className="mt-4"></div>
            {/* 下載連結 */}
            <div className="flex flex-wrap gap-2 mt-4">
                <a id="exportMidi" ref={exportMidiRef} className="btn btn-outline">
                    Export MIDI
                </a>
                <a id="exportWav" ref={exportWavRef} className="btn btn-outline">
                    Export WAV
                </a>
                <a id="exportMp3" ref={exportMp3Ref} className="btn btn-outline">
                    Export MP3
                </a>
            </div>
        </div>
    );
};

export default MusicEmbed;