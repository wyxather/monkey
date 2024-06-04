"use client";

import {
  Button,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Switch,
} from "@nextui-org/react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";
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

function ButtonLink(props: PropsWithChildren<{ href: string }>) {
  const pathname = usePathname();
  const isActive = pathname === props.href;
  return (
    <Button
      as={Link}
      variant={isActive ? "solid" : "light"}
      color={isActive ? "primary" : "default"}
      href={props.href}
    >
      {props.children}
    </Button>
  );
}

export function NavigationBar() {
  return (
    <Navbar>
      <NavbarBrand>
        <p className="font-bold text-inherit uppercase">monkey</p>
      </NavbarBrand>

      <NavbarContent justify="center">
        <NavbarItem>
          <ButtonLink href="/profiles">Profiles</ButtonLink>
        </NavbarItem>
        <NavbarItem>
          <ButtonLink href="/categories">Categories</ButtonLink>
        </NavbarItem>
        <NavbarItem>
          <ButtonLink href="/transactions">Transactions</ButtonLink>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <ThemeSwitcher />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
