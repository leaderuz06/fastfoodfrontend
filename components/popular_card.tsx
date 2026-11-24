
"use client";

import UICard from "@/ui/card";
import { useEffect, useState } from "react";

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

const PopularCards = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/menu"
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        // console.log("Menus:", data); 

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
    return <p className="p-8">Loading...</p>;
  }

  if (error) {
    return <p className="p-8 text-red-500">{error}</p>;
  }

  return (
    <div className="bg-[rgba(248,248,248,1)]">

      <div className="flex justify-between my-8 px-8">
        <h1 className="font-bold text-6xl text-[rgba(187,35,57,1)] capitalize my-2 px-2">
          Popular Dishes
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10 p-10">
      {menus.slice(0, 4).map((menu) => (
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

export default PopularCards;
