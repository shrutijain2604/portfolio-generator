Fonts used by the Retro Desktop template, and where each one came from.

ms-sans-serif.woff2, ms-sans-serif-bold.woff2
    The bitmap MS Sans Serif face that Windows 95 and 98 drew their entire
    interface in. Taken from the 98.css project (MIT, Jordan Scales), which
    packaged the original bitmap font as a webfont. See
    ms-sans-serif-LICENSE.txt. Render it at 11px with no antialiasing: the
    face has no outlines to smooth, and smoothing it is what makes most
    Windows 95 recreations look wrong.

selawik-regular.woff2, selawik-semibold.woff2
    Microsoft's own open-source, metric-compatible substitute for Segoe UI,
    under the SIL Open Font License. Windows visitors get real Segoe UI from
    their system; everyone else gets these, at the same metrics, so the
    Windows 11 shell keeps its line lengths and spacing either way. Subset to
    Latin plus the punctuation the template renders. See selawik-LICENSE.txt.

inter-regular.woff2, inter-medium.woff2, inter-semibold.woff2
    Stands in for SF Pro in the macOS shell, under the SIL Open Font License.
    Mac visitors resolve -apple-system to real SF before these load; everyone
    else gets Inter, which is the closest freely licensed match. Subset the
    same way. See inter-LICENSE.txt.

Apple's SF Pro is deliberately absent: its licence does not cover serving it
from a website, and on the machines where it matters the system already has it.
