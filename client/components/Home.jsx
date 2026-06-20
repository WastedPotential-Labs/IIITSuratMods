import { useNavigate } from "react-router-dom"
export default function Home(){
  const nav =useNavigate();

  return(
    <>
      {nav('./login')}
      <h1>Home Page</h1>
    </>
  )
}
