#!/bin/awk -f

# Detect code-blocks
$1 == "///" && $2 == "```" {
	figure = !figure
	if (figure) {
		indent = 0
		print "\n```c#"
		next
	}
}

# Transform comments
$1 == "///" {
	print substr($0, index($0, "/")+4)
}

# Set indent
figure && !indent && $1 != "///" {
	indent = match($0, /[^ \t]/)
}

# Print code-blocks
$1 != "///" && figure {
	print substr($0, indent)
}
