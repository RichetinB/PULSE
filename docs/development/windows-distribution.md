# Windows distribution

PULSE is packaged as a Windows NSIS installer by the `windows-tauri` GitHub
Actions job in `.github/workflows/ci.yml`.

## CI artifacts

Every successful Windows build uploads a `pulse-windows-installer` artifact.
Pull request and branch builds do not publish GitHub Releases.

## GitHub Releases

Pushing a version tag such as `v0.1.0` runs the Windows build and publishes the
generated `.exe` installer to the matching GitHub Release. Release publishing
uses `contents: write` only on the tag-gated release job; other jobs have
read-only repository permissions.

## WebView2

The installer uses Tauri's WebView2 download bootstrapper. Windows 10 and 11
systems normally already include WebView2, but a clean machine may need an
internet connection during installation to download the Microsoft WebView2
runtime. PULSE cannot start until that runtime is available.

## Installing and launching

1. Download the `.exe` from the repository's GitHub Release.
2. Run the installer and allow it to complete.
3. Launch **PULSE** from the Start menu or the installed shortcut.

The release binary is unsigned. Windows SmartScreen may warn that the
publisher is unknown. Confirm the file was downloaded from this repository's
GitHub Release, select **More info**, and choose **Run anyway** only when the
source is trusted.

## Portable ZIP status

No portable ZIP is published by default. A ZIP containing only source code or
an unvalidated executable must not be presented as a portable application.
Portable distribution can be added after a Windows smoke test confirms that
the extracted compiled application launches with the documented WebView2
runtime requirement.
