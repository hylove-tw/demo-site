// src/components/MusicEmbed.tsx
import React, {useRef, useEffect} from 'react';
import Embed from 'flat-embed';

interface MusicEmbedProps {
    musicXML: string;
    height?: string;
}

const MusicEmbed: React.FC<MusicEmbedProps> = ({musicXML, height = '500px'}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const embedRef = useRef<any>(null);

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
            // 載入 musicXML

            embedRef.current.loadMusicXML(musicXML).catch((error: any) => {
                console.error('Error loading musicXML:', error);
            });
        }
    }, [musicXML, height]);

    return <div id="embed-example" ref={containerRef} className="mt-4"></div>;
};

export default MusicEmbed;