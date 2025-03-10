import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-black border-t dark:border-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4 dark:text-gray-100">TryoutXpert</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Platform tryout online terpercaya untuk persiapan ujian nasional, SBMPTN, dan berbagai ujian lainnya.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-400">
                <Twitter size={20} />
              </Link>
              <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400">
                <Instagram size={20} />
              </Link>
              <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                <Youtube size={20} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 dark:text-gray-100">Tautan Cepat</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  Hubungi Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-bold mb-4 dark:text-gray-100">Kategori</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/category/sma" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  SMA
                </Link>
              </li>
              <li>
                <Link href="/category/sbmptn" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  SBMPTN
                </Link>
              </li>
              <li>
                <Link href="/category/cpns" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  CPNS
                </Link>
              </li>
              <li>
                <Link href="/category/toefl" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  TOEFL
                </Link>
              </li>
              <li>
                <Link href="/category/professional" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  Sertifikasi Profesional
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4 dark:text-gray-100">Kontak</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-2 mt-0.5 text-gray-600 dark:text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">
                  Jl. Pendidikan No. 123, Jakarta Selatan, 9999
                </p>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">+62 81 2358 3112</p>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">info@tryxpert.id</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-red-400 dark:text-red-300 text-sm">
              &quot;⚠ Situs ini masih dalam tahap pengembangan. Beberapa fitur mungkin belum berfungsi sepenuhnya, dan kredit akan segera ditambahkan. Terima kasih atas pengertiannya!&quot;
            </p>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-4 text-sm">
                <li>
                  <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Syarat & Ketentuan
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Kebijakan Privasi
                  </Link>
                </li>
                <li>
                  <Link href="/cookie" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Kebijakan Cookie
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}