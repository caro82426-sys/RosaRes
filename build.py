from __future__ import annotations

import re
from pathlib import Path

CSS_MODULES = [
    Path("css/base.css"),
    Path("css/layout.css"),
    Path("css/components.css"),
    Path("css/pages.css"),
]


def minify_css() -> None:
    combined = "\n".join(path.read_text(encoding="utf-8") for path in CSS_MODULES)
    combined = re.sub(r"/\*.*?\*/", "", combined, flags=re.S)
    combined = re.sub(r"\s+", " ", combined)
    combined = (
        combined.replace(" {", "{")
        .replace("{ ", "{")
        .replace(" }", "}")
        .replace("; ", ";")
        .replace(": ", ":")
        .replace(", ", ",")
    )
    Path("css/styles.min.css").write_text(combined.strip(), encoding="utf-8")


def minify_js() -> None:
    code = Path("js/main.js").read_text(encoding="utf-8")
    out: list[str] = []
    in_string = False
    string_char = ""
    escape = False
    whitespace = set(" \n\t\r")
    separators = set(";,{}()[]:+-*/%&|=!<>?")
    for ch in code:
        if in_string:
            out.append(ch)
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == string_char:
                in_string = False
        else:
            if ch in ("'", '"', "`"):
                in_string = True
                string_char = ch
                out.append(ch)
            elif ch in whitespace:
                if out and out[-1] not in whitespace | separators:
                    out.append(" ")
            else:
                out.append(ch)
    minified = (
        "".join(out)
        .replace(" ;", ";")
        .replace(" ,", ",")
        .replace(" )", ")")
        .replace("( ", "(")
    )
    Path("js/main.min.js").write_text(minified.strip(), encoding="utf-8")


def minify_html() -> None:
    src_dir = Path("src/pages")
    for page in src_dir.glob("*.html"):
        text = page.read_text(encoding="utf-8")
        minified = re.sub(r"\s+", " ", text)
        minified = re.sub(r">\s+<", "><", minified)
        Path(page.name).write_text(minified.strip(), encoding="utf-8")


if __name__ == "__main__":
    minify_css()
    minify_js()
    minify_html()
    print("Assets minificados.")
