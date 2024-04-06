class Accordions {
	static #accordionsInstance

	#allAccordions
	#options

	constructor(options) {
		if (Accordions.#accordionsInstance) {
			return Accordions.#accordionsInstance
		}

		this.#options = options

		this.#findAllAccordions()
		this.#addFunctionality()

		Accordions.#accordionsInstance = this
	}

	#findAllAccordions() {
		const accordionSelector = this.#options?.accordionSelector ?? '[data-accordion]'

		this.#allAccordions = document.querySelectorAll(accordionSelector)
	}

	#addFunctionality() {
		if (!this.#allAccordions) {
			return
		}

		let animationPlaying = false

		const oneOpenedPerGroup = this.#options?.oneOpenedPerGroup ?? false

		const customWrapperSelector = this.#options?.customAccordionSelectors?.wrapper ?? '[data-accordion-wrapper]'
		const customHeaderSelector = this.#options?.customAccordionSelectors?.header ?? '[data-accordion-header]'
		const customPanelSelector = this.#options?.customAccordionSelectors?.panel ?? '[data-accordion-panel]'

		this.#allAccordions.forEach(accordion => {
			const accordionElement = {
				accordion,
				accordionWrappers: Array.from(accordion.querySelectorAll(`details, ${customWrapperSelector}`)),
				accordionHeaders: Array.from(accordion.querySelectorAll(`summary, ${customHeaderSelector}`)),
				accordionPanels: Array.from(accordion.querySelectorAll(`summary+*, ${customPanelSelector}`)),
			}

			if (accordionElement.accordionWrappers[0].tagName !== 'DETAILS') {
				accordionElement.accordionPanels.forEach(toggleCustomAccordionFocusability)
			}

			accordion.addEventListener('click', (e) => {
				if (accordionElement.accordionHeaders.includes(e.target)) {
					const selectedIndex = accordionElement.accordionHeaders.indexOf(e.target)

					if (oneOpenedPerGroup) {
						const openedElement = accordionElement.accordionWrappers.find(wrapper => wrapper.hasAttribute('open') || wrapper.hasAttribute('data-open'))
						const openedElementIndex = accordionElement.accordionWrappers.indexOf(openedElement)
						if (openedElementIndex !== -1) {
							toggleState(accordionElement, openedElementIndex, e)
						}
					}

					toggleState(accordionElement, selectedIndex, e)
				}
			})

			accordionElement.accordionPanels.forEach(panel => {
				panel.addEventListener('animationstart', (e) => {
					animationPlaying = true
				})

				panel.addEventListener('animationend', (e) => {
					const accordionWrapper = accordionElement.accordionWrappers[accordionElement.accordionPanels.indexOf(panel)]
					toggleAttributes(accordionWrapper, panel, accordionWrapper.tagName === 'DETAILS' ? 'open' : 'data-open')
				})
			})
		})

		function toggleState(accordionElement, selectedIndex, e) {
			const currentWrapper = accordionElement.accordionWrappers[selectedIndex]

			const stateAttribute = currentWrapper.tagName === 'DETAILS' ? 'open' : 'data-open'

			e.preventDefault()

			if (animationPlaying) {
				return
			}

			if (currentWrapper.hasAttribute(stateAttribute)) {
				currentWrapper.classList.add('--closing')
			} else {
				currentWrapper.setAttribute(stateAttribute, '')
				currentWrapper.classList.add('--opening')
			}
		}

		function toggleAttributes(currentWrapper, currentPanel, stateAttribute) {
			if (currentWrapper.classList.contains('--closing')) {
				currentWrapper.classList.remove('--closing')
				currentWrapper.removeAttribute(stateAttribute)
			} else if (currentWrapper.classList.contains('--opening')) {
				currentWrapper.classList.remove('--opening')
				currentWrapper.setAttribute(stateAttribute, '')
			}

			if (stateAttribute === 'data-open') {
				toggleCustomAccordionFocusability(currentPanel)
			}

			animationPlaying = false
		}

		function toggleCustomAccordionFocusability(panel) {
			const focusElements = [
				'a[href]',
				'area[href]',
				'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
				'select:not([disabled]):not([aria-hidden])',
				'textarea:not([disabled]):not([aria-hidden])',
				'button:not([disabled]):not([aria-hidden])',
				'iframe',
				'object',
				'embed',
				'[contenteditable]',
				'[tabindex]:not([tabindex^="-"])'
			]

			const focusableElements = panel.querySelectorAll(focusElements)
			focusableElements.forEach(focusableElement => {
				focusableElement.tabIndex !== -1 ? focusableElement.tabIndex = -1 : focusableElement.tabIndex = 0
			})
		}
	}

	get allAccordions() {
		return this.#allAccordions
	}
}

export default Accordions