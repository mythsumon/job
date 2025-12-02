import { useEffect } from "react";

export function useDisableRightClick() {
  useEffect(() => {
    // 🔧 TEMPORARILY DISABLED FOR DEBUGGING - 디버깅을 위해 임시 비활성화
    // 나중에 다시 활성화하려면 아래 주석을 제거하고 console.log를 제거하세요!
    
    console.log("🔓 Right-click and F12 protection temporarily disabled for debugging");
    
    // Empty function - all security features disabled for debugging
    return () => {
      console.log("🔓 Security cleanup (currently disabled)");
    };
    
    /*
    // ============ 원래 보안 코드 (주석처리됨) ============
    
    // Disable right click and context menu
    const disableContextMenu = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Disable right mouse button
    const disableRightClick = (e: MouseEvent) => {
      if (e.button === 2) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Comprehensive keyboard shortcut blocking
    const disableKeyboardShortcuts = (e: KeyboardEvent) => {
      if (!e.key) return; // Guard against undefined key
      const key = e.key.toLowerCase();
      const ctrlKey = e.ctrlKey || e.metaKey;
      const shiftKey = e.shiftKey;
      const altKey = e.altKey;

      // Block F12 and F-keys that might open dev tools
      if (key === "f12" || key === "f1" || key === "f2" || key === "f3" || 
          key === "f4" || key === "f5" || key === "f6" || key === "f7" || 
          key === "f8" || key === "f9" || key === "f10" || key === "f11") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Block developer tools shortcuts
      if (ctrlKey && shiftKey && (key === "i" || key === "j" || key === "c" || key === "k")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Block view source
      if (ctrlKey && key === "u") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Block console shortcuts
      if (ctrlKey && key === "j") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Block elements inspector
      if (ctrlKey && shiftKey && key === "c") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Block network tab
      if (ctrlKey && shiftKey && key === "e") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Block sources/debugger
      if (ctrlKey && shiftKey && key === "s") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Block application tab
      if (ctrlKey && shiftKey && key === "a") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Block security tab
      if (ctrlKey && shiftKey && key === "i") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Block console in Firefox
      if (shiftKey && key === "f12") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Block Firebug
      if (key === "f12" && shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Block Chrome DevTools
      if (ctrlKey && shiftKey && key === "i") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Block Edge DevTools
      if (key === "f12") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Block Safari Web Inspector
      if (ctrlKey && altKey && key === "i") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Block Opera Dragonfly
      if (ctrlKey && shiftKey && key === "i") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Block save page
      if (ctrlKey && key === "s") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Block print
      if (ctrlKey && key === "p") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Block select all (optional, might affect user experience)
      if (ctrlKey && key === "a") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Block copy (optional, might affect user experience)
      if (ctrlKey && key === "c") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Disable text selection
    const disableSelection = () => {
      if (window.getSelection) {
        window.getSelection()?.removeAllRanges();
      }
    };

    // Disable drag and drop
    const disableDragDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Disable image saving
    const disableImageSave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Add event listeners
    document.addEventListener("contextmenu", disableContextMenu, true);
    document.addEventListener("mousedown", disableRightClick, true);
    document.addEventListener("mouseup", disableRightClick, true);
    document.addEventListener("keydown", disableKeyboardShortcuts, true);
    document.addEventListener("keyup", disableKeyboardShortcuts, true);
    document.addEventListener("selectstart", disableSelection, true);
    document.addEventListener("dragstart", disableDragDrop, true);
    document.addEventListener("drop", disableDragDrop, true);
    document.addEventListener("mousedown", disableImageSave, true);

    // Disable console access attempts
    const originalConsole = window.console;
    (window as any).console = {
      log: () => {},
      warn: () => {},
      error: () => {},
      info: () => {},
      debug: () => {},
      clear: () => {},
      dir: () => {},
      dirxml: () => {},
      table: () => {},
      trace: () => {},
      group: () => {},
      groupEnd: () => {},
      time: () => {},
      timeEnd: () => {},
      profile: () => {},
      profileEnd: () => {},
      count: () => {},
      assert: () => {},
    };

    // Detect DevTools opening attempts
    let devtools = false;
    const detectDevTools = () => {
      if (window.outerHeight - window.innerHeight > 200 || 
          window.outerWidth - window.innerWidth > 200) {
        if (!devtools) {
          devtools = true;
          alert("개발자 도구 사용이 금지되어 있습니다.");
          window.location.reload();
        }
      }
    };

    const devToolsInterval = setInterval(detectDevTools, 500);

    // Cleanup on unmount
    return () => {
      document.removeEventListener("contextmenu", disableContextMenu, true);
      document.removeEventListener("mousedown", disableRightClick, true);
      document.removeEventListener("mouseup", disableRightClick, true);
      document.removeEventListener("keydown", disableKeyboardShortcuts, true);
      document.removeEventListener("keyup", disableKeyboardShortcuts, true);
      document.removeEventListener("selectstart", disableSelection, true);
      document.removeEventListener("dragstart", disableDragDrop, true);
      document.removeEventListener("drop", disableDragDrop, true);
      document.removeEventListener("mousedown", disableImageSave, true);
      
      // Restore console
      (window as any).console = originalConsole;
      clearInterval(devToolsInterval);
    };
    
    ============ 보안 코드 끝 ============
    */
  }, []);
}