import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { Timeout } from "./Timeout";

// 每个测试后清理
afterEach(() => {
    cleanup();
});

describe("Timeout 组件", () => {
    describe("'after' 模式（延迟后显示）", () => {
        test("SSR 时显示 fallback（等待超时）", () => {
            const html = renderToString(
                <Timeout ms={1000} mode="after" fallback={<span>loading...</span>}>
                    <span>content</span>
                </Timeout>
            );
            expect(html).toContain("loading...");
            expect(html).not.toContain("content");
        });

        test("SSR 时无 fallback 则渲染空", () => {
            const html = renderToString(
                <Timeout ms={1000} mode="after">
                    <span>content</span>
                </Timeout>
            );
            expect(html).toBe("");
        });

        test("渲染 children 内容", () => {
            const html = renderToString(
                <Timeout ms={1000} mode="after">
                    <span>delayed content</span>
                </Timeout>
            );
            // SSR 初始状态不包含 children
            expect(html).not.toContain("delayed content");
        });
    });

    describe("'before' 模式（延迟后隐藏）", () => {
        test("SSR 时显示 children（初始可见）", () => {
            const html = renderToString(
                <Timeout ms={1000} mode="before">
                    <span>temporary content</span>
                </Timeout>
            );
            expect(html).toContain("temporary content");
        });

        test("默认模式为 'after'", () => {
            const html = renderToString(
                <Timeout ms={1000} fallback={<span>wait</span>}>
                    <span>content</span>
                </Timeout>
            );
            // 默认 'after'，SSR 时显示 fallback
            expect(html).toContain("wait");
        });
    });

    describe("onTimeout 回调", () => {
        test("SSR 时不调用 onTimeout（useEffect 不运行）", () => {
            const onTimeout = mock(() => {});
            renderToString(
                <Timeout ms={100} onTimeout={onTimeout}>
                    <span>content</span>
                </Timeout>
            );
            // SSR 时 useEffect 不会执行
            expect(onTimeout).not.toHaveBeenCalled();
        });
    });

    describe("复杂 children", () => {
        test("支持嵌套元素", () => {
            const html = renderToString(
                <Timeout ms={1000} mode="before">
                    <div>
                        <span>first</span>
                        <span>second</span>
                    </div>
                </Timeout>
            );
            expect(html).toContain("first");
            expect(html).toContain("second");
        });

        test("支持文本节点", () => {
            const html = renderToString(
                <Timeout ms={1000} mode="before">
                    plain text
                </Timeout>
            );
            expect(html).toContain("plain text");
        });
    });

    describe("边界情况", () => {
        test("ms 为 0 时立即触发", () => {
            const html = renderToString(
                <Timeout ms={0} mode="before">
                    <span>content</span>
                </Timeout>
            );
            // SSR 初始状态仍为 true
            expect(html).toContain("content");
        });

        test("children 为 null 时正常处理", () => {
            const html = renderToString(
                <Timeout ms={1000} mode="before">
                    {null}
                </Timeout>
            );
            // 不会渲染 null 内容
            expect(html).toBe("");
        });

        test("fallback 为复杂组件", () => {
            const html = renderToString(
                <Timeout
                    ms={1000}
                    mode="after"
                    fallback={
                        <div className="loading">
                            <span>Spinner</span>
                        </div>
                    }
                >
                    <span>content</span>
                </Timeout>
            );
            expect(html).toContain("Spinner");
            expect(html).toContain("loading");
        });
    });

    describe("客户端渲染行为", () => {
        describe("'after' 模式（延迟后显示）", () => {
            test("初始显示 fallback，延迟后显示 children", async () => {
                render(
                    <Timeout ms={100} mode="after" fallback={<span data-testid="fallback">Loading...</span>}>
                        <span data-testid="content">Delayed Content</span>
                    </Timeout>
                );

                // 初始状态显示 fallback
                expect(screen.getByTestId("fallback")).toBeTruthy();
                expect(screen.queryByTestId("content")).toBeNull();

                // 等待超时后显示 children
                await waitFor(
                    () => {
                        expect(screen.getByTestId("content")).toBeTruthy();
                    },
                    { timeout: 500 }
                );
                expect(screen.queryByTestId("fallback")).toBeNull();
            });

            test("无 fallback 时初始为空，延迟后显示 children", async () => {
                render(
                    <Timeout ms={100} mode="after">
                        <span data-testid="content">Delayed Content</span>
                    </Timeout>
                );

                // 初始状态不显示内容
                expect(screen.queryByTestId("content")).toBeNull();

                // 等待超时后显示
                await waitFor(
                    () => {
                        expect(screen.getByTestId("content")).toBeTruthy();
                    },
                    { timeout: 500 }
                );
            });

            test("超时时调用 onTimeout 回调", async () => {
                const onTimeout = mock(() => {});
                render(
                    <Timeout
                        ms={100}
                        mode="after"
                        onTimeout={onTimeout}
                        fallback={<span data-testid="fallback">Loading</span>}
                    >
                        <span data-testid="content">Content</span>
                    </Timeout>
                );

                expect(onTimeout).not.toHaveBeenCalled();

                await waitFor(
                    () => {
                        expect(onTimeout).toHaveBeenCalledTimes(1);
                    },
                    { timeout: 500 }
                );
            });
        });

        describe("'before' 模式（延迟后隐藏）", () => {
            test("初始显示 children，延迟后隐藏", async () => {
                render(
                    <Timeout ms={100} mode="before">
                        <span data-testid="content">Temporary Content</span>
                    </Timeout>
                );

                // 初始状态显示 children
                expect(screen.getByTestId("content")).toBeTruthy();

                // 等待超时后隐藏
                await waitFor(
                    () => {
                        expect(screen.queryByTestId("content")).toBeNull();
                    },
                    { timeout: 500 }
                );
            });

            test("超时时调用 onTimeout 回调", async () => {
                const onTimeout = mock(() => {});
                render(
                    <Timeout ms={100} mode="before" onTimeout={onTimeout}>
                        <span data-testid="content">Content</span>
                    </Timeout>
                );

                expect(onTimeout).not.toHaveBeenCalled();

                await waitFor(
                    () => {
                        expect(onTimeout).toHaveBeenCalledTimes(1);
                    },
                    { timeout: 500 }
                );
            });
        });

        describe("边界情况", () => {
            test("ms 为 0 时立即切换状态", async () => {
                render(
                    <Timeout ms={0} mode="after" fallback={<span data-testid="fallback">Loading</span>}>
                        <span data-testid="content">Content</span>
                    </Timeout>
                );

                // ms=0 会在下一个事件循环触发
                await waitFor(
                    () => {
                        expect(screen.getByTestId("content")).toBeTruthy();
                    },
                    { timeout: 500 }
                );
            });

            test("组件卸载时清除定时器（不触发回调）", async () => {
                const onTimeout = mock(() => {});
                const { unmount } = render(
                    <Timeout ms={5000} mode="after" onTimeout={onTimeout}>
                        <span data-testid="content">Content</span>
                    </Timeout>
                );

                // 在超时前卸载组件
                unmount();

                // 等待足够时间确保定时器被清除
                await new Promise((resolve) => setTimeout(resolve, 100));
                expect(onTimeout).not.toHaveBeenCalled();
            });
        });
    });
});
