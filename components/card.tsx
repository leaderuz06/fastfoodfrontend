// import Image from 'next/image'
// import Link from 'next/link'


// const MainCard = () => {
//   return (
//     <div className='flex flex-row justify-between my-8 px-8'>
//       <div className='w-1/2 '>
//         <p className='font-bold text-6 text-white tracking-wide my-2 capitalize'>Chase the new Flavour</p>
//         <h1 className='font-bold text-8xl text-white capitalize my-2.5'>The key to Fine dining</h1>
//         <p className='font-medium text-base tracking-wide text-white opacity-80 w-1/2 my-9'>Sit tellus lobortis sed senectus vivamus molestie. Condimentum volutpat morbi facilisis quam scelerisque sapien. Et, penatibus aliquam amet tellus </p>
//         <Link
//         href="/"
//         className="border-2 border-white rounded-full px-8 py-2 text-white"
//       >
//         Explore Menu
//       </Link>
//       </div>
//       <div className='flex flex-row align-baseline ml-20'>
//         <Image src='/Group 93.png' alt='food image' width={854} height={604} className='inset-x-0 p-20' />
//       </div>
//     </div>
//   )
// }

// export default MainCard


import Image from 'next/image'
import Link from 'next/link'

const MainCard = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-12">

        {/* Left Content */}
        <div className="flex flex-col items-start">
          <p className="text-white font-semibold text-sm tracking-wide mb-4">
            Chase The New Flavour
          </p>

          <h1 className="text-white text-5xl lg:text-6xl font-bold leading-[1.2] tracking-wide mb-5">
            The Key To
            <br />
            Fine Dining
          </h1>

          <p className="text-white/75 text-sm leading-relaxed max-w-md mb-7">
            Sit tellus lobortis sed senectus vivamus molestie.
            Condimentum volutpat morbi facilisis quam scelerisque
            sapien. Et, penatibus aliquam amet tellus.
          </p>

          <Link
            href="/"
            className="border border-white rounded-full px-7 py-2.5
            text-white text-sm font-medium hover:bg-white
            hover:text-[#C2213D] transition-all duration-300"
          >
            Explore Menu
          </Link>
        </div>

        {/* Right Image */}
        <div className="relative w-full flex justify-center items-center">
          <Image
            src="/Group 93.png"
            alt="Delicious grilled food"
            width={600}
            height={450}
            priority
            className="w-full max-w-130 h-auto object-contain"
          />
        </div>

      </div>
    </section>
  )
}

export default MainCard
