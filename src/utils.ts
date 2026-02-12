import type { ReactNode } from "react";

/** Node that can be either a ReactNode or a function returning a ReactNode | 可以是 ReactNode 或返回 ReactNode 的函数 */
export type ResolvableNode = ReactNode | (() => ReactNode);

/** Resolve a node that may be a function into a ReactNode | 将可能是函数的节点解析为 ReactNode */
export function resolveNode(node: ResolvableNode): ReactNode {
    return typeof node === "function" ? node() : node;
}
