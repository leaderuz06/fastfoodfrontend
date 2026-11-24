import MainCard from "@/components/card"
import Comments from "@/components/comment"
import Footer from "@/components/footer"
import PopularCards from "@/components/popular_card"
import RegularPack from "@/components/regular-pack"



function Home() {
  return (
    <>
      <MainCard />
      <PopularCards />
      <RegularPack />
      <Comments />
      <Footer />
    </>
  )
}

export default Home