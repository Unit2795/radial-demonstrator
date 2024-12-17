import Grid from "./components/Grid/Grid.tsx";

function App() {
  return (
    <div className={"flex min-h-screen"}>
        <div className={'bg-white text-black w-20'}>
            TOOLBAR
        </div>
        <div className={'flex-1'}>
            <Grid/>
        </div>
    </div>
  )
}

export default App
