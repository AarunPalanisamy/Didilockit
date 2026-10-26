import { memo, type ReactElement } from 'react';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import type { ArtKind } from '../../types';

type Props = {
  kind: ArtKind;
  /** Rendered width; height keeps the 120×96 aspect ratio. */
  width?: number;
};

const SHADOW = 'rgba(21,21,26,0.08)';
const INDIGO = '#5B4BFF';
const INDIGO_DEEP = '#3A2EA8';
const LINE = '#D6D3E6';

/** Flat illustrations matching the "Soft Tiles" design (viewBox 120×96). */
function CheckArtBase({ kind, width = 120 }: Props) {
  return (
    <Svg width={width} height={(width * 96) / 120} viewBox="0 0 120 96" accessible={false}>
      {ART[kind]}
    </Svg>
  );
}

export const CheckArt = memo(CheckArtBase);

const ART: Record<ArtKind, ReactElement> = {
  door: (
    <>
      <Ellipse cx={60} cy={92} rx={40} ry={3} fill={SHADOW} />
      <Rect x={26} y={4} width={68} height={88} rx={5} fill="#8E4E33" />
      <Rect x={31} y={9} width={58} height={83} rx={3} fill="#D98A5F" />
      <Rect x={38} y={16} width={44} height={26} rx={3} fill="#E9A27A" />
      <Rect x={38} y={50} width={44} height={32} rx={3} fill="#E9A27A" />
      <Rect x={74} y={42} width={7} height={9} rx={2} fill={INDIGO} />
      <Circle cx={77.5} cy={58} r={4} fill="#FFD166" />
      <Rect x={18} y={88} width={84} height={6} rx={3} fill="#C9C3FF" />
    </>
  ),
  stove: (
    <>
      <Ellipse cx={60} cy={92} rx={44} ry={3} fill={SHADOW} />
      <Rect x={26} y={10} width={30} height={12} rx={4} fill={INDIGO} />
      <Rect x={56} y={14} width={22} height={4} rx={2} fill={INDIGO_DEEP} />
      <Rect x={14} y={24} width={92} height={12} rx={6} fill="#2B2B35" />
      <Ellipse cx={40} cy={27} rx={12} ry={2.5} fill="#4A4A56" />
      <Ellipse cx={80} cy={27} rx={12} ry={2.5} fill="#4A4A56" />
      <Rect x={18} y={34} width={84} height={56} rx={8} fill="#FFFFFF" stroke={LINE} strokeWidth={1.5} />
      {[34, 52, 70, 88].map((cx) => (
        <Circle key={cx} cx={cx} cy={46} r={5} fill="#E3E1EE" stroke="#B9B5CF" />
      ))}
      <Path d="M34 42v4M52 42v4M70 42v4M88 42v4" stroke={INDIGO} strokeWidth={2} strokeLinecap="round" />
      <Rect x={30} y={58} width={60} height={24} rx={4} fill="#F1F0F6" stroke={LINE} />
      <Rect x={44} y={60} width={32} height={3} rx={1.5} fill="#B9B5CF" />
    </>
  ),
  iron: (
    <>
      <Ellipse cx={62} cy={90} rx={44} ry={3} fill={SHADOW} />
      <Path d="M40 22c0-6 4-10 4-14M52 22c0-6 4-10 4-14" stroke="#C9C3FF" strokeWidth={2.5} strokeLinecap="round" />
      <Path d="M50 40C50 22 60 18 74 18h18a6 6 0 0 1 6 6v16" stroke={INDIGO_DEEP} strokeWidth={7} strokeLinecap="round" fill="none" />
      <Path d="M20 72C24 50 44 40 70 40h28a8 8 0 0 1 8 8v24z" fill="#7B6CFF" />
      <Rect x={16} y={72} width={92} height={9} rx={4.5} fill="#C9CBD6" />
      <Circle cx={90} cy={56} r={4.5} fill="#FF7A59" />
      <Path d="M106 54c12 0 12 26 2 34" stroke="#8A8C99" strokeWidth={2.5} strokeLinecap="round" fill="none" />
    </>
  ),
  window: (
    <>
      <Ellipse cx={60} cy={92} rx={44} ry={3} fill={SHADOW} />
      <Rect x={22} y={6} width={76} height={78} rx={6} fill="#FFFFFF" stroke={LINE} strokeWidth={2} />
      <Rect x={28} y={12} width={30} height={66} rx={3} fill="#A9D4F5" />
      <Rect x={62} y={12} width={30} height={66} rx={3} fill="#A9D4F5" />
      <Circle cx={80} cy={28} r={7} fill="#FFD166" />
      <Circle cx={38} cy={34} r={6} fill="#FFFFFF" />
      <Circle cx={46} cy={32} r={7} fill="#FFFFFF" />
      <Rect x={34} y={34} width={18} height={6} rx={3} fill="#FFFFFF" />
      <Rect x={56} y={40} width={8} height={12} rx={2} fill={INDIGO} />
      <Path d="M14 6c8 20 8 50 2 80h-2z" fill="#E8E4FF" />
      <Path d="M106 6c-8 20-8 50-2 80h2z" fill="#E8E4FF" />
      <Rect x={14} y={84} width={92} height={7} rx={3.5} fill="#E3E1EE" />
    </>
  ),
  fan: (
    <>
      <Ellipse cx={60} cy={92} rx={34} ry={3} fill={SHADOW} />
      <Rect x={57} y={62} width={6} height={24} rx={3} fill="#9A9CAB" />
      <Ellipse cx={60} cy={87} rx={24} ry={5} fill="#7B6CFF" />
      <Circle cx={60} cy={36} r={30} fill="#FFFFFF" stroke={LINE} strokeWidth={2} />
      <Ellipse cx={60} cy={22} rx={7} ry={14} fill="#8CCFE8" />
      <Ellipse cx={60} cy={22} rx={7} ry={14} fill="#8CCFE8" transform="rotate(120 60 36)" />
      <Ellipse cx={60} cy={22} rx={7} ry={14} fill="#8CCFE8" transform="rotate(240 60 36)" />
      <Circle cx={60} cy={36} r={6} fill={INDIGO} />
    </>
  ),
  wifi: (
    <>
      <Ellipse cx={60} cy={90} rx={42} ry={3} fill={SHADOW} />
      <Path d="M44 22q16-14 32 0M50 30q10-8 20 0" stroke={INDIGO} strokeWidth={3.5} strokeLinecap="round" fill="none" />
      <Circle cx={60} cy={38} r={3.5} fill={INDIGO} />
      <Rect x={30} y={34} width={5} height={26} rx={2.5} fill="#2B2B35" />
      <Rect x={85} y={34} width={5} height={26} rx={2.5} fill="#2B2B35" />
      <Rect x={20} y={56} width={80} height={28} rx={9} fill="#FFFFFF" stroke={LINE} strokeWidth={1.5} />
      <Circle cx={40} cy={70} r={3} fill="#2EE59D" />
      <Circle cx={52} cy={70} r={3} fill="#2EE59D" />
      <Circle cx={64} cy={70} r={3} fill={INDIGO} />
      <Rect x={74} y={67} width={16} height={6} rx={3} fill="#E3E1EE" />
    </>
  ),
  gas: (
    <>
      <Ellipse cx={60} cy={92} rx={30} ry={3} fill={SHADOW} />
      <Path d="M68 13c18 0 30 6 34 20" stroke="#2B2B35" strokeWidth={3} strokeLinecap="round" fill="none" />
      <Rect x={46} y={18} width={28} height={12} rx={4} fill="#C94A39" />
      <Rect x={52} y={6} width={16} height={13} rx={3} fill={INDIGO} />
      <Circle cx={74} cy={12} r={4} fill="#FFD166" />
      <Rect x={36} y={28} width={48} height={58} rx={18} fill="#E85D4A" />
      <Rect x={36} y={50} width={48} height={5} fill="#C94A39" />
      <Rect x={44} y={36} width={8} height={12} rx={4} fill="rgba(255,255,255,0.35)" />
      <Rect x={40} y={84} width={40} height={6} rx={3} fill="#B23F30" />
    </>
  ),
  custom: (
    <>
      <Ellipse cx={60} cy={92} rx={38} ry={3} fill={SHADOW} />
      <Path d="M24 44 60 14l36 30v42a4 4 0 0 1-4 4H28a4 4 0 0 1-4-4z" fill="#FFFFFF" stroke={LINE} strokeWidth={2} />
      <Rect x={50} y={58} width={20} height={32} rx={3} fill="#E8E4FF" />
      <Circle cx={86} cy={26} r={14} fill={INDIGO} />
      <Path d="m80 26 4 4 8-8" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
};
