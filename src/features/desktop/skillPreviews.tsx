import type { ReactNode } from 'react'
import type { Lang } from './highlight'
import { Browser, Build, Phone } from './PreviewFrames'

/** A line in a terminal: a command typed at the prompt, or what it printed */
export type TermLine = { cmd: string } | { out: string }

/**
 * What Quick Look shows for a skill: a file of code (highlighted), and how it runs. `run` is a
 * terminal under the code; `render` a live preview beside it (a phone, a browser…); `table` a
 * result grid. `terminal` makes the whole preview a terminal session; `notebook` a Kaggle notebook.
 */
export interface Preview {
  file: string
  lang: Lang
  code?: string
  run?: TermLine[]
  render?: ReactNode
  table?: { head: string[]; rows: string[][] }
  /** a bar above the code, e.g. Postman's request, or an IDE's build status */
  bar?: ReactNode
  terminal?: TermLine[]
  notebook?: { code: string; out?: string; table?: { head: string[]; rows: string[][] } }[]
}

const $ = (cmd: string): TermLine => ({ cmd })
const o = (out: string): TermLine => ({ out })

export const PREVIEWS: Record<string, Preview> = {
  /* ───── Languages ───── */
  C: {
    file: 'hello.c',
    lang: 'c',
    code: `#include <stdio.h>

int main(void) {
    printf("Hello, World!\\n");
    return 0;
}`,
    run: [$('gcc hello.c -o hello && ./hello'), o('Hello, World!')],
  },
  'C++': {
    file: 'hello.cpp',
    lang: 'cpp',
    code: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
    run: [$('clang++ -std=c++20 hello.cpp -o hello && ./hello'), o('Hello, World!')],
  },
  Swift: {
    file: 'hello.swift',
    lang: 'swift',
    code: `let name = "World"
print("Hello, \\(name)!")`,
    run: [$('swift hello.swift'), o('Hello, World!')],
  },
  JavaScript: {
    file: 'hello.js',
    lang: 'js',
    code: `const greet = (name) => \`Hello, \${name}!\`

console.log(greet('World'))`,
    run: [$('node hello.js'), o('Hello, World!')],
  },
  Python: {
    file: 'hello.py',
    lang: 'python',
    code: `def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("World"))`,
    run: [$('python3 hello.py'), o('Hello, World!')],
  },
  MySQL: {
    file: 'hello.sql',
    lang: 'sql',
    code: `SELECT 'Hello, World!' AS greeting,
       VERSION()       AS server;`,
    table: { head: ['greeting', 'server'], rows: [['Hello, World!', '8.4.2']] },
  },
  HTML: {
    file: 'index.html',
    lang: 'html',
    code: `<!doctype html>
<html>
  <body>
    <h1>Hello, World!</h1>
    <p>Built by hand.</p>
  </body>
</html>`,
    render: (
      <Browser url="index.html">
        <h1 className="ql-r-h1">Hello, World!</h1>
        <p className="ql-r-p">Built by hand.</p>
      </Browser>
    ),
  },
  CSS: {
    file: 'style.css',
    lang: 'css',
    code: `.hello {
  padding: 16px 28px;
  border-radius: 999px;
  color: white;
  background: linear-gradient(
    90deg, #ff8a5c, #e8508f
  );
  box-shadow: 0 10px 30px #e8508f55;
}`,
    render: (
      <Browser url="style.css">
        <div className="ql-r-center">
          <span className="ql-r-pill">Hello, World!</span>
        </div>
      </Browser>
    ),
  },

  /* ───── Frameworks & libraries ───── */
  SwiftUI: {
    file: 'ContentView.swift',
    lang: 'swift',
    code: `import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: "globe")
            Text("Hello, World!")
                .font(.title.bold())
        }
    }
}`,
    render: (
      <Phone>
        <div className="ql-r-ios">
          <span className="ql-r-globe">🌐</span>
          <strong>Hello, World!</strong>
        </div>
      </Phone>
    ),
  },
  'React Native': {
    file: 'App.tsx',
    lang: 'ts',
    code: `import { StyleSheet, Text, View } from 'react-native'

export default function App() {
  return (
    <View style={s.screen}>
      <Text style={s.title}>Hello, World!</Text>
    </View>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 24, textAlign: 'center' },
})`,
    render: (
      <Phone>
        <div className="ql-r-rn">Hello, World!</div>
      </Phone>
    ),
  },
  React: {
    file: 'App.jsx',
    lang: 'js',
    code: `import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)
  return (
    <button onClick={() => setCount(count + 1)}>
      Hello, World! × {count}
    </button>
  )
}`,
    render: (
      <Browser url="localhost:5173">
        <div className="ql-r-center">
          <span className="ql-r-button">Hello, World! × 3</span>
        </div>
      </Browser>
    ),
  },
  Firebase: {
    file: 'hello.js',
    lang: 'js',
    code: `import { getFirestore, collection, addDoc } from 'firebase/firestore'

const db = getFirestore(app)
const ref = await addDoc(collection(db, 'greetings'), {
  text: 'Hello, World!',
  at: Date.now(),
})
console.log('Saved', ref.id)`,
    run: [$('node hello.js'), o('Saved 7fK2qLx9VbN4mT1aZr8e')],
  },
  'Tailwind CSS': {
    file: 'Hello.jsx',
    lang: 'js',
    code: `<main className="grid place-items-center">
  <h1 className="rounded-2xl bg-sky-500
                 px-6 py-3 text-2xl
                 font-bold text-white
                 shadow-lg">
    Hello, World!
  </h1>
</main>`,
    render: (
      <Browser url="localhost:5173">
        <div className="ql-r-center">
          <span className="ql-r-tw">Hello, World!</span>
        </div>
      </Browser>
    ),
  },
  NumPy: {
    file: 'arrays.py',
    lang: 'python',
    code: `import numpy as np

a = np.arange(1, 7).reshape(2, 3)
print(a)
print("mean:", a.mean(), "  sum:", a.sum())`,
    run: [$('python3 arrays.py'), o('[[1 2 3]'), o(' [4 5 6]]'), o('mean: 3.5   sum: 21')],
  },
  pandas: {
    file: 'apps.py',
    lang: 'python',
    code: `import pandas as pd

df = pd.DataFrame({
    "app": ["SwiftShareX", "SmartGalleryX"],
    "stack": ["React Native · C++", "PyTorch · FastAPI"],
    "year": [2025, 2026],
})
print(df)`,
    table: {
      head: ['', 'app', 'stack', 'year'],
      rows: [
        ['0', 'SwiftShareX', 'React Native · C++', '2025'],
        ['1', 'SmartGalleryX', 'PyTorch · FastAPI', '2026'],
      ],
    },
  },
  PyTorch: {
    file: 'tensors.py',
    lang: 'python',
    code: `import torch

x = torch.tensor([[1., 2.], [3., 4.]], requires_grad=True)
y = (x ** 2).sum()
y.backward()
print(x.grad)`,
    run: [$('python3 tensors.py'), o('tensor([[2., 4.],'), o('        [6., 8.]])')],
  },
  FastAPI: {
    file: 'main.py',
    lang: 'python',
    code: `from fastapi import FastAPI

app = FastAPI()

@app.get("/hello/{name}")
def hello(name: str):
    return {"message": f"Hello, {name}!"}`,
    run: [$('curl localhost:8000/hello/World'), o('{"message":"Hello, World!"}')],
  },

  /* ───── Tools ───── */
  Xcode: {
    file: 'HelloApp.swift',
    lang: 'swift',
    bar: <Build ok="Build Succeeded">HelloApp › iPhone 17 Pro · 1.4 s</Build>,
    code: `import SwiftUI

@main
struct HelloApp: App {
    var body: some Scene {
        WindowGroup {
            Text("Hello, World!")
        }
    }
}`,
    render: (
      <Phone>
        <div className="ql-r-ios">
          <strong>Hello, World!</strong>
        </div>
      </Phone>
    ),
  },
  'Android Studio': {
    file: 'MainActivity.kt',
    lang: 'kotlin',
    bar: <Build ok="BUILD SUCCESSFUL">in 2s · 34 actionable tasks</Build>,
    code: `class MainActivity : ComponentActivity() {
    override fun onCreate(state: Bundle?) {
        super.onCreate(state)
        setContent {
            Text("Hello, World!")
        }
    }
}`,
    render: (
      <Phone>
        <div className="ql-r-android">Hello, World!</div>
      </Phone>
    ),
  },
  'VS Code': {
    file: 'settings.json',
    lang: 'json',
    code: `{
  "editor.fontFamily": "SF Mono, Menlo",
  "editor.fontSize": 14,
  "editor.formatOnSave": true,
  "editor.minimap.enabled": false,
  "workbench.colorTheme": "Default Dark Modern",
  "terminal.integrated.fontSize": 13
}`,
  },
  Git: {
    file: 'zsh — hello',
    lang: 'sh',
    terminal: [
      $('git init hello && cd hello'),
      o('Initialized empty Git repository in ~/hello/.git/'),
      $('echo "Hello, World!" > README.md'),
      $('git add . && git commit -m "Say hello"'),
      o('[main (root-commit) 4f2c1ab] Say hello'),
      o(' 1 file changed, 1 insertion(+)'),
      $('git log --oneline'),
      o('4f2c1ab (HEAD -> main) Say hello'),
    ],
  },
  Postman: {
    file: 'Hello World — GET',
    lang: 'json',
    bar: (
      <div className="ql-req">
        <span className="ql-req-method">GET</span>
        <span className="ql-req-url">https://api.example.com/v1/hello?name=World</span>
        <span className="ql-req-send">Send</span>
      </div>
    ),
    code: `{
  "message": "Hello, World!",
  "status": 200,
  "time": "42 ms"
}`,
  },
  Expo: {
    file: 'zsh — hello',
    lang: 'sh',
    terminal: [
      $('npx create-expo-app@latest hello'),
      o('✅ Your project is ready!'),
      $('cd hello && npx expo start'),
      o('Starting Metro Bundler'),
      o('› Metro waiting on exp://192.168.1.20:8081'),
      o('› Scan the QR code above with Expo Go'),
      o('› Press i │ open iOS simulator'),
      o('› Press a │ open Android'),
    ],
  },
  Kaggle: {
    file: 'hello-world.ipynb',
    lang: 'python',
    notebook: [
      { code: `import pandas as pd\nprint("Hello, World!")`, out: 'Hello, World!' },
      {
        code: `df = pd.read_csv("/kaggle/input/titanic/train.csv")\ndf[["Name", "Survived"]].head(3)`,
        table: {
          head: ['', 'Name', 'Survived'],
          rows: [
            ['0', 'Braund, Mr. Owen Harris', '0'],
            ['1', 'Cumings, Mrs. John Bradley', '1'],
            ['2', 'Heikkinen, Miss. Laina', '1'],
          ],
        },
      },
    ],
  },
}
