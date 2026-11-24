
"use client";

import UICard from "@/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";

const regularPackMenu = [
  { name: "All", link: "/" },
  { name: "Shawarma", link: "/" },
  { name: "Turk Kebab", link: "/" },
  { name: "Hamburger Kebab", link: "/" },
  { name: "Doner kebab", link: "/" },
  { name: "Shish kebab", link: "/" },
  { name: "French fries Pizza", link: "/" },
  { name: "Desserts", link: "/" },
];

interface Menu {
  id: number;
  image: string;
  name: string;
  price: number;
  userId: number;
  user?: {
    id: number;
    name: string;
  };
}

const RegularPack = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/menu");

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setMenus(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load menus");
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  if (loading) {
    return <p className="p-5 sm:p-8">Loading...</p>;
  }

  if (error) {
    return <p className="p-5 sm:p-8 text-red-500">{error}</p>;
  }

  return (
    <div className="bg-white w-full">

      {/* Heading */}
      <div className="my-6 sm:my-8 px-4 sm:px-6 lg:px-10">
        <h1 className="font-bold text-3xl sm:text-4xl lg:text-6xl text-[rgba(187,35,57,1)] capitalize">
          Our Regular Menu Pack
        </h1>
      </div>

      {/* Category Buttons */}
      <div className="my-6 sm:my-8 px-4 sm:px-6 lg:px-10">
        <div className="flex gap-3 sm:gap-4 overflow-x-auto whitespace-nowrap pb-3 scrollbar-hide">
          {regularPackMenu.map((menu) => (
            <Link
              key={menu.name}
              href={menu.link}
              className="shrink-0 font-bold text-sm sm:text-base text-white border-2 border-transparent bg-[rgba(187,35,57,1)] rounded-xl sm:rounded-2xl px-5 sm:px-8 py-2 hover:text-black hover:bg-white hover:border-[rgba(187,35,57,1)] transition-all duration-300"
            >
              {menu.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Menu Cards */}
      <div className="
  grid
  grid-cols-1
  min-[480px]:grid-cols-2
  lg:grid-cols-3
  xl:grid-cols-4
  gap-5
  sm:gap-6
  lg:gap-8
  p-4
  sm:p-6
  lg:p-10
">
  {menus.map((menu) => (
    <UICard
      key={menu.id}
      image={menu.image}
      alt={menu.name}
      title={menu.name}
      price={menu.price}
      userName={menu.user?.name || "Unknown"}
    />
  ))}
</div>

    </div>
  );
};

export default RegularPack;
