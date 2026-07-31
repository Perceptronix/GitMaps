export const __rspack_esm_id = 17313;
export const __rspack_esm_ids = [17313];
export const __webpack_modules__ = {
    928198(t, e, s) {
        s.r(e);
        var i = s(331635),
            c = s(651135);
        class r extends HTMLElement {
            toggle() {
                this.isOn() ? this.turnOff() : this.turnOn()
            }
            turnOn() {
                this.isDisabled() || (this.switch.setAttribute("aria-checked", "true"), this.classList.add("ToggleSwitch--checked"))
            }
            turnOff() {
                this.isDisabled() || (this.switch.setAttribute("aria-checked", "false"), this.classList.remove("ToggleSwitch--checked"))
            }
            isOn() {
                return "true" === this.switch.getAttribute("aria-checked")
            }
            isDisabled() {
                return "true" === this.switch.getAttribute("aria-disabled")
            }
        }(0, i.Cg)([c.aC], r.prototype, "switch", void 0), r = (0, i.Cg)([(0, c.p_)("toggle-switch")], r), s.d(e, {
            ToggleSwitchElement: () => r
        })
    }
};
//# sourceMappingURL=chunk-lazy-element-toggle-switch-e24ee00c8ecfc50e-e67b57c4082fcaae.js.map