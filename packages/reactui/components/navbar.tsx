import React from 'react';

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem
} from '@nextui-org/navbar';
import { Link } from '@nextui-org/link';
import { IconFlexiGPT } from '@/reactui/components/ui/icons';
import { ThemeToggle } from '@/reactui/components/theme-switcher';

import { Sidebar } from '@/reactui/components/sidebar';

export function FlexiNavbar() {
  return (
    <Navbar isBordered>
      <NavbarItem className="justify-start">
        <Sidebar />
      </NavbarItem>
      <NavbarContent>
        <NavbarBrand className="flex-grow justify-center">
          <Link
            className="font-bold text-inherit"
            href="https://github.com/ppipada/vscode-flexigpt"
            isExternal
          >
            <IconFlexiGPT className="mr-2" />
            FlexiGPT
          </Link>
        </NavbarBrand>
        <NavbarItem className="justify-end">
          <ThemeToggle />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
