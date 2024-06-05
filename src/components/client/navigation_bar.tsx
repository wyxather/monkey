"use client";

import {
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Switch,
} from "@nextui-org/react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa6";

function ThemeSwitcher() {
  const theme = useTheme();
  return (
    <Switch
      size="lg"
      startContent={<FaSun />}
      endContent={<FaMoon />}
      onValueChange={(value: boolean) =>
        value ? theme.setTheme("light") : theme.setTheme("dark")
      }
    />
  );
}

function NavigationLink(props: PropsWithChildren<{ href: string }>) {
  const pathname = usePathname();
  const isActive = pathname === props.href;
  return (
    <Link
      color={isActive ? "primary" : "foreground"}
      href={props.href}
      className="sm:w-fit w-full justify-center"
    >
      {props.children}
    </Link>
  );
}

export function NavigationBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <Navbar onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
          className="sm:hidden"
        />

        <NavbarBrand>
          <p className="font-bold text-inherit uppercase">monkey</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="center" className="hidden sm:flex">
        <NavbarItem>
          <NavigationLink href="/profiles">Profiles</NavigationLink>
        </NavbarItem>

        <NavbarItem>
          <NavigationLink href="/categories">Categories</NavigationLink>
        </NavbarItem>

        <NavbarItem>
          <NavigationLink href="/transactions">Transactions</NavigationLink>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <ThemeSwitcher />
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        <NavbarMenuItem>
          <NavigationLink href="/profiles">Profiles</NavigationLink>
        </NavbarMenuItem>

        <NavbarMenuItem>
          <NavigationLink href="/categories">Categories</NavigationLink>
        </NavbarMenuItem>

        <NavbarMenuItem>
          <NavigationLink href="/transactions">Transactions</NavigationLink>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
