enum DarkOrBrightSpecified {
    //% block="暗い"
    IS_DARK,
    //% block="明るい"
    IS_BRIGHT,
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


    let _今まで暗い: boolean = false;
    const _暗い判定閾値: number = 8;
    const _明るい判定閾値: number = 15;
    const _HYSTERESIS: number = _明るい判定閾値 - _暗い判定閾値;


    /**
     * micro:bit本体の明るさセンサーが暗い場合（8未満）に真を返します。
     */
    //% blockId=is_dark block="is dark"
    //% group="micro:bit本体"
    export function isDark(): boolean {
        return _isDark(_暗い判定閾値, _明るい判定閾値);

    }

    /* 明るさの平均を取る */
    function _lightLevelSampling(): number {
        const CYCLE_SAMPLE_NUM: number = 50
        let accum明るさ: number = 0;
        for (let i = 0; i < CYCLE_SAMPLE_NUM; i++) {
            accum明るさ += input.lightLevel();
            basic.pause(1);
        }
        let 明るさ = accum明るさ / CYCLE_SAMPLE_NUM;
        return 明るさ;
    }

    /* 暗い判定本体 */
    function _isDark(暗い判定閾値: number, 明るい判定閾値: number): boolean {
        if ((暗い判定閾値 > 明るい判定閾値)
            || (暗い判定閾値 < 0)
            || (暗い判定閾値 > 255)
            || (明るい判定閾値 < 0)
            || (明るい判定閾値 > 255)) {
            control.assert(false, "threshold is abnormal");
        }

        let 現在の明るさ = _lightLevelSampling();

        const 暗い: boolean = true;
        const 明るい: boolean = false;

        if (_今まで暗い) { //現在まで暗い環境だったとき。明るいかを判定
            if (現在の明るさ > 明るい判定閾値) {
                _今まで暗い = 明るい;
                return 明るい; //現在は明るい
            }
            else {
                _今まで暗い = 暗い;
                return 暗い; //現在は暗い
            }
        }
        else { // 現在まで明るい環境だったとき。暗いかを判定
            if (現在の明るさ < 暗い判定閾値) {
                _今まで暗い = 暗い;
                return 暗い; //現在は暗い
            }
            else {
                _今まで暗い = 明るい;
                return 明るい; //現在は明るい
            }
        }
        control.assert(false);
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
    
    /**
     * micro:bit本体の明るさセンサーが閾値より暗い（または明るい）場合に真を返します。
     * @param lightThreshold number of brightness-threshold, eg: 15
     */
    //% blockId=brightness_determination
    //% block="%lightThreshold|より%settingDarkOrBright|"
    //% lightThreshold.min=0 lightThreshold.max=255
    //% group="micro:bit本体"
    export function brightnessDetermination(lightThreshold: number, settingDarkOrBright: DarkOrBrightSpecified): boolean {
        if (_HYSTERESIS < 0) { control.assert(false); }
        if (lightThreshold < 0) {
            lightThreshold = 0;
        }
        if (lightThreshold > 255) {
            lightThreshold = 255;
        }

        if (settingDarkOrBright === DarkOrBrightSpecified.IS_DARK) {
            let 暗い判定閾値: number = lightThreshold;
            let 明るい判定閾値: number = lightThreshold + _HYSTERESIS;
            if (明るい判定閾値 > 255) { 明るい判定閾値 = 255; }
            return _isDark(暗い判定閾値, 明るい判定閾値);
        }
        else if (settingDarkOrBright === DarkOrBrightSpecified.IS_BRIGHT) {
            let 暗い判定閾値: number = lightThreshold - _HYSTERESIS;
            let 明るい判定閾値: number = lightThreshold;
            if (暗い判定閾値 < 0) { 暗い判定閾値 = 0; }
            return !_isDark(暗い判定閾値, 明るい判定閾値);
        }
        control.assert(false); return false;
    }
}
