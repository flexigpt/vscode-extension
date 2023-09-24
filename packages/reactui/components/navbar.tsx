import React from 'react';

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem
} from '@nextui-org/navbar';
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
          <IconFlexiGPT className="mr-2" />
          <p className="font-bold text-inherit">FlexiGPT</p>
        </NavbarBrand>
        <NavbarItem className="justify-end">
          <ThemeToggle />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
