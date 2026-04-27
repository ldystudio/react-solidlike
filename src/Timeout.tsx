import { type ReactNode, useEffect, useState } from "react";
import { resolveNode } from "./utils";

/** Timeout mode | 超时模式 */
/** @deprecated Use "show" instead. | 已废弃，请改用 "show"。 */
type DeprecatedTimeoutAfterMode = "after";

/** @deprecated Use "hide" instead. | 已废弃，请改用 "hide"。 */
type DeprecatedTimeoutBeforeMode = "before";

export type TimeoutMode = "show" | "hide" | DeprecatedTimeoutAfterMode | DeprecatedTimeoutBeforeMode;

function normalizeMode(mode: TimeoutMode): "show" | "hide" {
    return mode === "hide" || mode === "before" ? "hide" : "show";
}

export interface TimeoutProps {
    /** Delay time in milliseconds | 延迟时间（毫秒） */
    ms: number;
    /** Content to render | 要渲染的内容 */
    children: ReactNode;
    /** Display mode: 'show' = show after delay, 'hide' = hide after delay ('after'/'before' kept as aliases) | 显示模式：'show' = 延迟后显示，'hide' = 延迟后隐藏（'after'/'before' 作为兼容别名保留） */
    mode?: TimeoutMode;
    /** Content to show when hidden (only for 'show' mode) | 隐藏时显示的内容（仅 'show' 模式） */
    fallback?: ReactNode | (() => ReactNode);
    /** Callback when timeout occurs | 超时发生时的回调 */
    onTimeout?: () => void;
}

/**
 * Timeout component, shows or hides content after a specified delay
 *
 * 超时组件，在指定延迟后显示或隐藏内容
 *
 * @example
 * // Show content after delay (fade-in effect) | 延迟后显示内容（淡入效果）
 * <Timeout ms={1000} mode="show">
 *   <DelayedMessage />
 * </Timeout>
 *
 * @example
 * // Hide content after delay (auto-dismiss) | 延迟后隐藏内容（自动消失）
 * <Timeout ms={3000} mode="hide">
 *   <Toast message="Saved successfully!" />
 * </Timeout>
 *
 * @example
 * // With fallback while waiting | 等待时显示 fallback
 * <Timeout ms={2000} mode="show" fallback={<Spinner />}>
 *   <SlowComponent />
 * </Timeout>
 *
 * @example
 * // With onTimeout callback | 带超时回调
 * <Timeout ms={5000} mode="hide" onTimeout={() => console.log("Dismissed")}>
 *   <Notification />
 * </Timeout>
 */
export function Timeout({ ms, children, mode = "show", fallback = null, onTimeout }: TimeoutProps): ReactNode {
    const resolvedMode = normalizeMode(mode);
    const [ready, setReady] = useState(resolvedMode === "hide");

    useEffect(() => {
        const timer = setTimeout(() => {
            setReady((prev) => !prev);
            onTimeout?.();
        }, ms);

        return () => clearTimeout(timer);
    }, [ms, onTimeout]);

    if (resolvedMode === "show") {
        return ready ? children : resolveNode(fallback);
    }

    return ready ? children : null;
}
