class Accordions {
	static #all = {
		details: [],
		roleAccordions: [],
	}
	static #allDetails = []
	static #allRoleAccordions = []

	#roleAccordionSelector
	#oneOpenedPerGroup

	#animationPlaying = false

	constructor(roleAccordionSelector = '[data-accordion]', oneOpenedPerGroup = false) {
		this.#roleAccordionSelector = roleAccordionSelector
		this.#oneOpenedPerGroup = oneOpenedPerGroup

		this.#handleAllAccordions()
	}

	#handleAllAccordions() {
		const details = document.querySelectorAll(`details`)
		const roleAccordions = document.querySelectorAll(`${this.#roleAccordionSelector}`)

		details?.forEach(detail => {
			Accordions.#all.details.push(detail)
			Accordions.#allDetails.push(detail)
		})

		roleAccordions?.forEach(roleAccordion => {
			Accordions.#all.roleAccordions.push(roleAccordion)
			Accordions.#allRoleAccordions.push(roleAccordion)
		})

		this.#addFunctionality()
	}

	#addFunctionality() {
		if (!Accordions.#allDetails) return

		Accordions.#allDetails.forEach(details => {
			const expandButton = details.querySelector('summary')
			const expandableElement = details.querySelector('summary').nextElementSibling

			this.#assignEventListeners(details, expandButton, expandableElement)
		})

		if (!Accordions.#allRoleAccordions) return

		Accordions.#allRoleAccordions.forEach(roleAccordion => {
			const expandButton = roleAccordion.querySelector('button')
			const expandableElement = roleAccordion.querySelector('[role="region"], section')
			this.#roleAccordionToggleFocusability(expandableElement)

			this.#assignEventListeners(roleAccordion, expandButton, expandableElement)
		})
	}

	#assignEventListeners(parentElement, expandButton, expandableElement) {
		expandButton.addEventListener('click', this.#expandButtonClickHandler.bind(this, parentElement, expandableElement))
		expandableElement.addEventListener('animationstart', this.#dropdownAnimationStartHandler.bind(this))
		expandableElement.addEventListener('animationend', this.#dropdownAnimationEndHandler.bind(this))
	}

	#expandButtonClickHandler() {
		if (this.#oneOpenedPerGroup) {
			const groupAccordions = document.querySelectorAll(`[data-name="${arguments[0].getAttribute('data-name')}"]`)
			const openedAccordion = Array.from(groupAccordions).find(accordion => accordion.hasAttribute('open') || accordion.hasAttribute('data-open'))

			if (openedAccordion) {
				const openedAccordionExpandButton = openedAccordion.querySelector('summary, button')
				const openedAccordionExpandableElement = openedAccordionExpandButton.nextElementSibling ?? openedAccordionExpandButton.parentElement.nextElementSibling

				this.#toggleState(openedAccordion, openedAccordionExpandableElement)
			}
		}

		this.#toggleState(arguments[0], arguments[1], arguments[2])
	}

	#dropdownAnimationStartHandler(e) {
		this.#animationPlaying = true
	}

	#dropdownAnimationEndHandler(e) {
		this.#toggleAttributes(e.currentTarget.closest(`details, ${this.#roleAccordionSelector}`))
		this.#animationPlaying = false
	}

	#toggleState(accordion, expandableElement, e) {
		if (e) e.preventDefault()
		if (this.#animationPlaying) return

		if (accordion.hasAttribute('open') || accordion.hasAttribute('data-open')) {
			accordion.classList.add('--closing')
		} else {
			accordion.classList.add('--opening')
			if (accordion.tagName === 'DETAILS') {
				accordion.setAttribute('open', '')
			}
		}

		if (getComputedStyle(expandableElement).animationName === 'none') {
			this.#toggleAttributes(accordion)
		}
	}

	#toggleAttributes(accordion) {
		const stateAttribute = accordion.tagName === 'DETAILS' ? 'open' : 'data-open'

		if (accordion.classList.contains('--closing')) {
			accordion.classList.remove('--closing')
			accordion.removeAttribute(stateAttribute)
		} else if (accordion.classList.contains('--opening')) {
			accordion.classList.remove('--opening')
			accordion.setAttribute(stateAttribute, '')
		}

		if (stateAttribute === 'data-open') {
			this.#roleAccordionToggleCallback(accordion)
		}
	}

	#roleAccordionToggleCallback(accordion) {
		const expandButton = accordion.querySelector('button')
		const expandableElement = accordion.querySelector('[role="region"], section')

		if (accordion.hasAttribute('data-open')) {
			expandButton.setAttribute('aria-expanded', true)
			this.#roleAccordionToggleFocusability(expandableElement)
		} else {
			expandButton.setAttribute('aria-expanded', false)
			this.#roleAccordionToggleFocusability(expandableElement)
		}

		// console.log(accordion)
	}

	#roleAccordionToggleFocusability(expandableElement) {
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

		expandableElement.querySelectorAll(focusElements).forEach(focusElement => {
			focusElement.tabIndex !== -1 ? focusElement.tabIndex = -1 : focusElement.tabIndex = 0
		})
	}

	static get all() {
		return {
			details: this.#allDetails,
			roleAccordions: this.#allRoleAccordions,
		}
	}
}

export default Accordions