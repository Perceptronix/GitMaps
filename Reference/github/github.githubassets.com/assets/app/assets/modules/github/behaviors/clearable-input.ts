document.addEventListener('DOMContentLoaded', () => {
  for (const input of document.querySelectorAll<HTMLInputElement>('[data-clear-btn]')) {
    const btnId = input.getAttribute('data-clear-btn')
    if (!btnId) return
    const btn = document.getElementById(btnId) as HTMLButtonElement | null
    if (!btn) return

    function toggleBtn() {
      if (btn) btn.style.display = input.value ? 'flex' : 'none'
    }

    input.addEventListener('input', toggleBtn)
    btn.addEventListener('click', () => {
      input.value = ''
      input.focus()
      toggleBtn()
    })

    // Initial check
    toggleBtn()
  }
})

export {}
