import { useRef, useEffect } from 'react';

export function useRenderLogger(name = 'Component') {
    const count = useRef(1);
    useEffect(() => {
        if (__DEV__) {
            console.log(`[RENDER] ${name} → Render Count: ${count.current}`);
            count.current += 1;
        }
    });
}
