import { AnimationProperties } from '@dojo/framework/widget-core/meta/WebAnimation';

export function headTilt(id: string): AnimationProperties {
    const effects = [
    { transform: "rotate(0deg)" },
    { transform: "rotate(-5deg)" },
    { transform: "rotate(0deg)" },
    { transform: "rotate(5deg)" },
    { transform: "rotate(0deg)" }
    ];

    return {
    id,
    effects,
    timing: {
        duration: 1000,
        iterations: Infinity
    },
    controls: {
        play: true
    }
    };
};	
