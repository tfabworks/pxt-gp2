enum BrightnessEvent {
    //% block="暗い"
    IsDark = 1,
    //% block="明るい"
    IsBrighter = 2,
}

//% weight=70 icon="\uf0e7" color=#d2691e block="電気の利用"
namespace gp2 {
    //% blockId=human_detection block="人が動いた"
    export function humanDetection(): boolean {
        if (pins.digitalReadPin(DigitalPin.P2) == 1)
            return true;
        else
            return false;
    }
    //% blockId=turn_on block="スイッチON"
    export function turnON(): void {
        pins.digitalWritePin(DigitalPin.P1, 1)
    }
    //% blockId=turn_off block="スイッチOFF"
    export function turnOFF(): void {
        pins.digitalWritePin(DigitalPin.P1, 0)
    }
    //% blockId=is_dark block="暗い"
    export function isDark(): boolean {
        if (input.lightLevel() < 30)
            return true;
        else
            return false;
    }
    function getAnalogValue(p: AnalogPin): number {
        let arr: number[] = [];
        // Median filter
        for (; ;) {
            let val: number;
            // To prevent 255 from suddenly being measured
            // when using analog and LED at the same time
            if ((val = pins.analogReadPin(p)) != 255)
                arr.push(val);
            if (arr.length == 3)
                break;
        }
        arr.sort((n1, n2) => n1 - n2);
        return arr[1];
    }
    //% blockId=plot_bar_graph_analog block="蓄電量を表示"
    export function plotBarGraphAnalog() {
        led.plotBarGraph(
            getAnalogValue(AnalogPin.P0),
            1023
        )
    }
    //% blockId=brightness_determination block="%v より %flag"
    //% v.min=0 v.max=255
    export function brightnessDetermination(v: number, flag: BrightnessEvent): boolean {
        let res: boolean = true;
        if (flag == 2)
            res = !res;
        if (input.lightLevel() < v)
            return res;
        else
            return !res;
    }
}