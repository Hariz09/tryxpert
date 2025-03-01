// File: components/Navbar.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Navbar() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">TryXpert</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/" legacyBehavior passHref>
                    <NavigationMenuLink className="px-4 py-2 hover:text-blue-600 font-medium">
                      Beranda
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Mata Pelajaran</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid grid-cols-2 gap-3 p-4 w-96">
                      {['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA', 'IPS', 'Fisika', 'Kimia', 'Biologi'].map((subject) => (
                        <Link key={subject} href={`/subject/${subject.toLowerCase().replace(/\s+/g, '-')}`} className="p-2 hover:bg-gray-100 rounded-md">
                          {subject}
                        </Link>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/ranking" legacyBehavior passHref>
                    <NavigationMenuLink className="px-4 py-2 hover:text-blue-600 font-medium">
                      Peringkat
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/about" legacyBehavior passHref>
                    <NavigationMenuLink className="px-4 py-2 hover:text-blue-600 font-medium">
                      Tentang Kami
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
            
            <Avatar>
              <AvatarImage src="/avatars/user.png" alt="User" />
              <AvatarFallback>US</AvatarFallback>
            </Avatar>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="py-4 flex flex-col space-y-4">
                    <Link href="/" className="px-2 py-2 hover:bg-gray-100 rounded-md">
                      Beranda
                    </Link>
                    <Link href="/subjects" className="px-2 py-2 hover:bg-gray-100 rounded-md">
                      Mata Pelajaran
                    </Link>
                    <Link href="/ranking" className="px-2 py-2 hover:bg-gray-100 rounded-md">
                      Peringkat
                    </Link>
                    <Link href="/about" className="px-2 py-2 hover:bg-gray-100 rounded-md">
                      Tentang Kami
                    </Link>
                    <Link href="/profile" className="px-2 py-2 hover:bg-gray-100 rounded-md">
                      Profil Saya
                    </Link>
                    <Link href="/settings" className="px-2 py-2 hover:bg-gray-100 rounded-md">
                      Pengaturan
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}