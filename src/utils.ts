import type { ReactNode } from "react";

/** Node that can be either a ReactNode or a function returning a ReactNode | 可以是 ReactNode 或返回 ReactNode 的函数 */
export type ResolvableNode = ReactNode | (() => ReactNode);

/** Resolve a node that may be a function into a ReactNode | 将可能是函数的节点解析为 ReactNode */
export function resolveNode(node: ResolvableNode): ReactNode {
    return typeof node === "function" ? node() : node;
}

/** Whether a value should pass conditional rendering checks | 值是否应通过条件渲染检查 */
export function shouldRenderCondition(value: unknown): boolean {
    return Boolean(value) && !isEmptyConditionValue(value);
}

function isEmptyConditionValue(value: unknown): boolean {
    if (Array.isArray(value)) return value.length === 0;
    if (value instanceof Map || value instanceof Set) return value.size === 0;
    if (typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype) {
        return Object.keys(value).length === 0;
    }
    return false;
}
