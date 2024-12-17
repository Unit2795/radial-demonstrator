import Grid from "./components/Grid/Grid.tsx";

function App() {
  return (
    <div className={"flex min-h-screen"}>
        <div className={'bg-neutral-400 text-black w-20 flex flex-col gap-2'}>
            <button>Save</button>
            <button>Import</button>
        </div>
        <div className={'flex-1'}>
            <Grid/>
        </div>
    </div>
  )
}

export default App
