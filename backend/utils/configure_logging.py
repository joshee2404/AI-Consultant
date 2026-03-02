import logging
import sys

def configure_logging(level=logging.INFO):
    """Configure root logger once for the entire app."""
    root = logging.getLogger()
    # Avoid duplicate handlers if this is called more than once (e.g., reload)
    for h in list(root.handlers):
        root.removeHandler(h)

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
    ))

    root.setLevel(level)
    root.addHandler(handler)