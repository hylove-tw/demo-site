// src/components/BeatPatternStaff.tsx
//
// Draws a genre's accent pattern as one bar of notation instead of spelling it
// out as 「重-輕-輕」. The written form asks the reader to translate words back
// into a rhythm; a bar of notes is the notation musicians already read, and it
// shows the shape at a glance.
//
// Deliberately a single-line percussion staff: these patterns describe stress,
// not pitch, and a five-line staff would imply notes that are not there.

import React from 'react';

export interface BeatPatternStaffProps {
    /** Accent pattern, e.g. "重-輕-輕" — 重 is stressed, anything else is not. */
    pattern: string;
    /** Accessible description; falls back to the raw pattern. */
    label?: string;
}

const ACCENT = '重';

const NOTE_GAP = 15;
const LEFT_PAD = 9;
const RIGHT_PAD = 9;
const STAFF_Y = 20;
const STEM_HEIGHT = 13;

export const BeatPatternStaff: React.FC<BeatPatternStaffProps> = ({ pattern, label }) => {
    const beats = pattern.split('-').map((b) => b.trim()).filter(Boolean);
    if (beats.length === 0) return null;

    const width = LEFT_PAD + RIGHT_PAD + Math.max(beats.length - 1, 0) * NOTE_GAP;

    return (
        <svg
            viewBox={`0 0 ${width} 30`}
            width={width}
            height={30}
            role="img"
            aria-label={label ?? `節拍：${pattern}`}
            className="text-base-content/70 overflow-visible"
        >
            {/* 單線譜表 */}
            <line
                x1={2} y1={STAFF_Y} x2={width - 2} y2={STAFF_Y}
                stroke="currentColor" strokeWidth={1} opacity={0.45}
            />
            {/* 小節線（前後） */}
            <line x1={2} y1={STAFF_Y - 7} x2={2} y2={STAFF_Y + 7}
                  stroke="currentColor" strokeWidth={1} opacity={0.6} />
            <line x1={width - 2} y1={STAFF_Y - 7} x2={width - 2} y2={STAFF_Y + 7}
                  stroke="currentColor" strokeWidth={1} opacity={0.6} />

            {beats.map((beat, index) => {
                const accented = beat === ACCENT;
                const x = LEFT_PAD + index * NOTE_GAP;
                return (
                    <g key={index}>
                        {/* 符桿 */}
                        <line
                            x1={x + 3.4} y1={STAFF_Y - 1}
                            x2={x + 3.4} y2={STAFF_Y - STEM_HEIGHT}
                            stroke="currentColor"
                            strokeWidth={accented ? 1.4 : 1}
                            opacity={accented ? 1 : 0.65}
                        />
                        {/* 符頭：重拍實心、輕拍空心 */}
                        <ellipse
                            cx={x} cy={STAFF_Y}
                            rx={accented ? 3.9 : 3.2} ry={accented ? 2.9 : 2.4}
                            transform={`rotate(-20 ${x} ${STAFF_Y})`}
                            fill={accented ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth={accented ? 0 : 1.1}
                            opacity={accented ? 1 : 0.65}
                        />
                        {/* 重拍加上重音記號 */}
                        {accented && (
                            <path
                                d={`M ${x - 4} ${STAFF_Y + 6} L ${x + 4} ${STAFF_Y + 8} L ${x - 4} ${STAFF_Y + 10}`}
                                fill="none" stroke="currentColor" strokeWidth={1}
                                strokeLinecap="round" strokeLinejoin="round" opacity={0.8}
                            />
                        )}
                    </g>
                );
            })}
        </svg>
    );
};

export default BeatPatternStaff;
