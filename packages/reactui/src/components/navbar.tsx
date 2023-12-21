import React from 'react';

import { IconFlexiGPT } from './base/icons';

import { Anchor, Box, Button, Header } from 'grommet';
import { Menu, Moon, Sun } from 'grommet-icons';
import { GITHUB_REPO_URL } from '../lib/consts';

export interface AppHeaderProps {
  onMenuClick: () => void;
  onThemeToggle: () => void;
  theme: 'light' | 'dark';
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onMenuClick,
  onThemeToggle,
  theme
}) => {
  return (
    <Header
      background="brand"
      pad="small"
      elevation="medium"
      style={{
        zIndex: 1,
        position: 'sticky',
        top: 0
      }}
    >
      <Button icon={<Menu />} onClick={onMenuClick} />
      <Box direction="row" align="center" gap="small" flex justify="center">
        <Anchor
          className="flex items-center font-bold"
          href={GITHUB_REPO_URL}
          icon={<IconFlexiGPT className="inline-block align-middle mr-2" />}
          label="FlexiGPT"
          target="_blank"
          color={'text'}
        ></Anchor>
      </Box>
      <Button
        icon={theme === 'dark' ? <Sun /> : <Moon />}
        onClick={onThemeToggle}
      />
    </Header>
  );
};
