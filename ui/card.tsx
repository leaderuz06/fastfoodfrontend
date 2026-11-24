
import Image from "next/image";

interface UICardProps {
  image: string;
  alt: string;
  title: string;
  price: number;
  userName: string;
}

const UICard = ({
  image,
  alt,
  title,
  price,
  userName,
}: UICardProps) => {
  return (
    <div className="
      group
      w-full
      h-full
      bg-white
      rounded-2xl
      overflow-hidden
      border border-gray-100
      shadow-md
      hover:shadow-xl
      hover:-translate-y-2
      transition-all
      duration-300
    ">

      {/* Product Image */}
      <div className="
        w-full
        h-48
        sm:h-52
        lg:h-56
        bg-gray-50
        flex
        items-center
        justify-center
        overflow-hidden
        p-3
      ">
        {image && (
          <Image
            src={image}
            alt={alt}
            width={400}
            height={300}
            className="
              w-full
              h-full
              object-contain
              group-hover:scale-110
              transition-transform
              duration-500
            "
            unoptimized
          />
        )}
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex flex-col">

        <h2 className="
          font-bold
          text-lg
          sm:text-xl
          text-gray-900
          capitalize
          line-clamp-1
        ">
          {title}
        </h2>

        <p className="text-gray-500 text-xs sm:text-sm mt-2">
          Created by:
          <span className="font-semibold text-gray-800 ml-1">
            {userName}
          </span>
        </p>

        {/* Price */}
        <div className="
          flex
          items-center
          justify-between
          mt-4
          pt-3
          border-t
          border-gray-100
        ">
          <span className="text-gray-500 text-sm">
            Price
          </span>

          <p className="
            text-[rgba(187,35,57,1)]
            font-bold
            text-xl
            sm:text-2xl
          ">
            ${price}
          </p>
        </div>

      </div>
    </div>
  );
};

export default UICard;
