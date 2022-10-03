import { useState } from "react";
import { useKey } from "rooks";
import useResizeObserver from "use-resize-observer";
import styles from "./app.module.css";

type INode = {
  text: string;
  identLevel: number;
};

const Node = ({
  node,
  caret,
  identSize,
}: {
  node: INode;
  identSize: number;
  caret?: {
    width: number;
    height: number;
    col: number;
    row: number;
  };
}) => {
  console.log(caret);

  return (
    <div
      className="mt-1 relative"
      style={{ marginLeft: identSize * node.identLevel }}
    >
      {caret && (
        <div
          style={{
            position: "absolute",
            width: caret.width,
            height: caret.height,
            marginLeft: caret.col * caret.width,
            marginTop: caret.row * caret.height,
          }}
          className="opacity-20 bg-zinc-100"
        ></div>
      )}
      <div className="mb-1">{node.text}</div>
    </div>
  );
};

const Body = ({
  caretWidth,
  caretHeight,
  editorWidth,
}: {
  caretWidth: number;
  caretHeight: number;
  editorWidth: number;
}) => {
  const [nodes, setNodes] = useState<INode[]>([
    {
      text: "Everyone has the right to freedom of thought, conscience and religion; this right includes freedom to change his religion or belief, and freedom, either alone or in community with others and in public or private, to manifest his religion or belief in teaching, practice, worship and observance.",
      identLevel: 0,
    },
    {
      text: "Everyone has the right to freedom of opinion and expression; this right includes freedom to hold opinions without interference and to seek, receive and impart information and ideas through any media and regardless of frontiers.",
      identLevel: 1,
    },
    {
      text: "Everyone has the right to rest and leisure, including reasonable limitation of working hours and periodic holidays with pay.",
      identLevel: 0,
    },
  ]);
  const [caretPos, setCaretPos] = useState<{
    atText: number;
    nodeId: number;
  }>({ atText: 0, nodeId: 0 });

  const identSize = caretWidth * 2;
  const lineWidth = editorWidth - nodes[caretPos.nodeId].identLevel * identSize;
  const charsPerLine = Math.trunc(lineWidth / caretWidth);
  const currentLineNumber = Math.trunc(
    (caretWidth * (caretPos.atText + 1)) / lineWidth
  );
  const caretCol = caretPos.atText - charsPerLine * currentLineNumber;
  const caretRow = currentLineNumber;

  console.log(caretPos, charsPerLine);
  useKey(["h", "l", "j", "k"], (e) => {
    e.preventDefault();
    console.log(charsPerLine);
    const newPos = (() => {
      if (e.key === "l") {
        return caretPos.atText + 1;
      } else if (e.key === "h") {
        return caretPos.atText - 1;
      } else if (e.key === "j") {
        return caretPos.atText + charsPerLine;
      } else if (e.key === "k") {
        return caretPos.atText - charsPerLine;
      } else {
        return caretPos.atText;
      }
    })();

    setCaretPos(() => {
      const currentText = nodes[caretPos.nodeId];
      if (newPos > currentText.text.length) {
        if (nodes[caretPos.nodeId + 1] !== undefined) {
          return {
            nodeId: caretPos.nodeId + 1,
            atText: 0,
          };
        } else {
          return {
            nodeId: caretPos.nodeId,
            atText: currentText.text.length - 1,
          };
        }
      } else {
        if (newPos < 0) {
          if (nodes[caretPos.nodeId - 1] !== undefined) {
            return {
              nodeId: caretPos.nodeId - 1,
              atText: nodes[caretPos.nodeId - 1].text.length - 1,
            };
          } else {
            return {
              nodeId: caretPos.nodeId,
              atText: 0,
            };
          }
        } else {
          return {
            nodeId: caretPos.nodeId,
            atText: newPos,
          };
        }
      }
    });
  });

  return (
    <>
      {nodes.map((d, i) => (
        <Node
          node={d}
          identSize={identSize}
          key={i}
          caret={
            caretPos.nodeId === i
              ? {
                  width: caretWidth,
                  height: caretHeight,
                  col: caretCol,
                  row: caretRow,
                }
              : undefined
          }
        />
      ))}
    </>
  );
};
function App() {
  const { ref, width, height } = useResizeObserver<HTMLDivElement>({
    round: (n) => n,
  });

  const { ref: editorRef, width: editorWidth } =
    useResizeObserver<HTMLDivElement>({
      round: (n) => n,
    });

  return (
    <div
      className={`mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 text-left pt-5 break-all ${styles.editor}`}
    >
      <span
        style={{ position: "absolute", top: -100000, left: -100000 }}
        ref={ref}
      >
        0
      </span>

      <div ref={editorRef}>
        {width !== undefined &&
          height !== undefined &&
          editorWidth !== undefined && (
            <Body
              editorWidth={editorWidth}
              caretWidth={width}
              caretHeight={height}
            />
          )}
      </div>
    </div>
  );
}

export default App;
