export default function Admin(){
  function handleLogout(){
    localStorage.removeItem("userToken");
    localStorage.removeItem("userProfile");
    window.location.reload();
  }
  return(
    <>
      <h1>Admin Page</h1>
      <button onClick={handleLogout}>Logout</button>
    </>
  )
}
