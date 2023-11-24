import React from 'react';

import { Link } from '@nextui-org/link';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem
} from '@nextui-org/navbar';

import { Sidebar } from '@/components/sidebar';
import { ThemeToggle } from '@/components/theme-switcher';
import { IconFlexiGPT } from '@/components/ui/icons';

export function FlexiNavbar() {
  return (
    <Navbar isBordered>
      <NavbarContent justify="start">
        <Sidebar />
      </NavbarContent>
      <NavbarContent justify="center">
        <NavbarBrand className="flex-grow justify-center items-center">
          <Link
            className="flex items-center font-bold text-inherit"
            href="https://github.com/ppipada/vscode-flexigpt"
            isExternal
          >
            <IconFlexiGPT className="inline-block align-middle mr-2" /> FlexiGPT
          </Link>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <ThemeToggle />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
