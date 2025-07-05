import { Link } from 'react-router'
import { useState, useRef, useEffect } from 'react'
import CesarVallejo from '../../assets/CesarVallejo.png'
import { LogOut, Moon, Menu, X, ChevronDown } from "lucide-react"

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeLink, setActiveLink] = useState('/')

  const dropdownRef = useRef(null)

  const cerrarSesion = () => {
    if (window.confirm("¿Seguro que deseas cerrar sesión?")) {
      localStorage.removeItem('token'); 
      window.location.href = '/'; 
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])


  const navLinks = [
    { href: "/user/", label: "Inicio" },
    { href: "/user/history/", label: "Historial" },
  ]

  return (
    <nav className='fixed top-0 left-0 right-0 bg-linear-to-r from-yellow-400 to-yellow-100 backdrop-blur-sm z-50 border-b border-gray-100 shadow-sm'>
      <div className='w-full container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 md:h-20 h-20'> 
        <div className="flex items-center gap-2">
          {/* <Link to="/" onClick={() => setActiveLink('/')}> */}
            <img src={CesarVallejo} alt="CesarVallejo" className="h-23 w-auto opacity-75 rounded-full"/>
          {/* </Link> */}
          <div className="flex flex-col text-left">
            <p className="text-shadow text-sm sm:text-base md:text-x2 lg:text-xl">Centro de recursos educativos</p>
            <p className="text-shadow font-bold text-base sm:text-lg md:text-bold lg:text-2xl">"CESAR ABRAHAM VALLEJO MENDOZA"</p>
          </div>
        </div>
        <div className="h-6 border-l-2 border-black-400 mx-4"></div>

        {/* mobile menu button */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className='md:hidden p-2'>
          {isMenuOpen ? <X size={24} color="#000000" strokeWidth={3} absoluteStrokeWidth /> : <Menu size={24} color="#000000" strokeWidth={3} absoluteStrokeWidth />}
        </button>

        {/* desktop navitems */}
        <div className='hidden md:flex items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10'>
          {navLinks.map((link, index) => {
            if (link.label === "Reportes") {
              return (
                <div key={index} className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center gap-1 text-xs sm:text-sm md:text-base lg:text-lg font-bold relative 
                      after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 
                      hover:after:w-full after:bg-orange-600 after:transition-all
                      ${activeLink === link.href ? "text-orange-700 after:w-full" : "text-gray-600 hover:text-gray-900"}`}
                  >
                    {link.label}
                    <ChevronDown
                      className={`transform transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                      size={16}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div ref={dropdownRef} className="absolute left-0 z-50 mt-2 w-64 bg-white shadow-lg rounded-md transition-all duration-300">
                      <div className="py-2">
                        {menuItems.reportes.sections.map((section, i) => (
                          <Link
                            key={i}
                            to={section.path}
                            onClick={() => {
                              setIsDropdownOpen(false)
                              setActiveLink(link.href)
                            }}
                            className="block px-4 py-2 hover:bg-gray-100 transition-colors"
                          >
                            <p className="text-sm font-semibold text-gray-800">{section.title}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={index}
                to={link.href}
                onClick={() => setActiveLink(link.href)}
                className={`text-xs sm:text-sm md:text-base lg:text-lg font-bold relative 
                  after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 
                  hover:after:w-full after:bg-orange-600 after:transition-all
                  ${activeLink === link.href ? "text-orange-700 after:w-full" : "text-gray-600 hover:text-gray-900"}`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        <div className="h-6 border-l-2 border-black-400 mx-4"></div>

        {/* cerrar sesion y modo oscuro */}
        <button className="hover:scale-105 transition-transform">
          <Moon size={20} />
        </button>
        <button
          onClick={cerrarSesion}
          className='hidden md:block bg-red-500 text-white px-6 py-2.5 rounded-lg hover:bg-red-600 text-sm
            font-bold transition-all hover:shadow-lg hover:shadow-red-100 items-center gap-1 hover:scale-105'>
          <LogOut size={20} />
        </button>
      </div>

      {/* items del mobile menu */}
      {isMenuOpen && (
        <div className='md:hidden bg-white border-t border-gray-100 py-4'>
          <div className='container mx-auto px-4 space-y-3'>
            {navLinks.map((link, index) => {
              if (link.label === "Reportes") {
                return (
                  <div key={index}>
                    <button
                      onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                      className={`flex justify-between w-full text-sm font-medium py-2 ${
                        activeLink === link.href ? "text-orange-700" : "text-gray-600"
                      }`}
                    >
                      {link.label}
                      <ChevronDown
                        className={`transform transition-transform duration-200 ${
                          isMobileDropdownOpen ? "rotate-180" : ""
                        }`}
                        size={16}
                      />
                    </button>
                    {isMobileDropdownOpen && (
                      <div className="pl-4">
                        {menuItems.reportes.sections.map((section, i) => (
                          <Link
                            key={i}
                            to={section.path}
                            onClick={() => {
                              setIsMenuOpen(false)
                              setIsMobileDropdownOpen(false)
                              setActiveLink(link.href)
                            }}
                            className="block text-sm text-gray-700 py-1 hover:text-orange-700"
                          >
                            {section.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={index}
                  to={link.href}
                  onClick={() => {
                    setActiveLink(link.href)
                    setIsMenuOpen(false)
                  }}
                  className={`block text-sm font-medium py-2 ${
                    activeLink === link.href ? "text-orange-700" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}

            <button
              onClick={cerrarSesion}
              className='w-full bg-red-500 text-white px-6 py-2.5 rounded-lg hover:bg-red-600 text-sm
                font-bold transition-all hover:shadow-lg hover:shadow-red-100 flex items-center justify-center gap-1 hover:scale-105'
            >
              <LogOut size={20} />
              CERRAR SESIÓN
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
