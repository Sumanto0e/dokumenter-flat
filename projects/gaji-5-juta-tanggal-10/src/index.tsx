import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { Main } from './Main';
import { FPS, TOTAL } from './lib';

const Root: React.FC = () => (
  <Composition id="Gaji" component={Main} durationInFrames={Math.ceil(TOTAL * FPS)} fps={FPS} width={1920} height={1080} />
);
registerRoot(Root);
