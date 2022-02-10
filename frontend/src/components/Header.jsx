import { useState } from 'react';

import { HiMenuAlt4 } from 'react-icons/hi';
import { AiOutlineClose } from 'react-icons/ai';

import Logo from '../assets/images/logo.png';

function HeaderItem({ title, classProps }) {
  return (
    // 'mx-...': margin in X axis
    <li className={`mx-4 cursor-pointer ${classProps}`}>{title}</li>
  );
}

function Header() {
  const [toggleMenu, setToggleMennu] = useState();

  return (
    // 'md:...': set any attribute to medium devices
    // 'p-...': padding
    <nav className="w-full flex md:justify-center justify-between items-center p-4">
      <div className="md:flex-[0.5] flex-initial justify-center items-center">
        <img src={Logo} alt="Logo" className="w-32 cursor-pointer" />
      </div>
      <ul className="text-white md:flex hiddent list-none flex-row justify-between items-center flex-initial">
        {['Market', 'Exchange', 'Tutorials', 'Wallets'].map((item, index) => (
          <HeaderItem key={item + index} title={item} />
        ))}
        {/* 'py-...': top and bottom padding */}
        <li className="bg-[#2952e3] py-2 px-7 mx-4 rounded cursor-pointer hover:bg-[#2546bd]">
          Login
        </li>
      </ul>
      <div className="flex relative"></div>
    </nav>
  );
}

export default Header;
