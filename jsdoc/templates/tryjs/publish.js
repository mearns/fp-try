/* eslint-disable no-empty-function, no-unused-vars */
/**
    @param {TAFFY} taffyData See <http://taffydb.com/>.
    @param {object} opts
    @param {Tutorial} tutorials
 */
exports.publish = (taffyData, opts, tutorials) => {
    const heirarchy = buildHeirarchy(taffyData);
    const tryInterface = heirarchy.contents.Try;
    const fields = [];
    const functions = {
        static: [],
        instance: [],
        inner: []
    };
    Object.values(tryInterface.contents).forEach(member => {
        switch (member.def.kind) {
            case "function":
                {
                    const functionsInScope = functions[member.def.scope];
                    if (!functionsInScope) {
                        throw new Error(
                            `Unknown scope for function ${member.def.longname}: ${member.def.scope}`
                        );
                    }
                    functionsInScope.push(member);
                }
                break;

            case "member":
                fields.push(member);
                break;

            default:
                throw new Error(
                    `Unknown kind for ${member.def.longname}: ${member.def.kind}`
                );
        }
    });
    console.log("# `Try` interface");
    console.log("");
    ["static", "instance"].forEach(scope => {
        console.log(`## ${scope} functions`);
        console.log("");
        functions[scope].forEach(func => {
            const params = func.def.params || [];
            console.log(
                `### \`${func.def.name}(${params
                    .map(p => p.name)
                    .join(", ")})\``
            );
            if (func.def.description) {
                console.log("");
                console.log(func.def.description);
            }

            if (params.length) {
                console.log("");
                console.log("| Parameter | Type | Description |");
                console.log("|-----------|------|-------------|");
                params.forEach(p => {
                    console.log(
                        `| **${p.name}** | ${typeToMarkdown(
                            p.type
                        )} | ${(p.description &&
                            p.description.replace(/[\r\n]+/g, " ")) ||
                            ""} |`
                    );
                });
            }

            if (func.def.returns) {
                if (func.def.returns.length !== 1) {
                    throw new Error(
                        `don't know how to handle multiple returns: ${func.def.longname}`
                    );
                }
                const ret = func.def.returns[0];
                console.log("");
                console.log("|  |  |  |");
                console.log("| ---- | ---- | ---- |");
                console.log(
                    `| **Returns** | ${typeToMarkdown(
                        ret.type
                    )} | ${(ret.description &&
                        ret.description.replace(/[\r\n]+/g, " ")) ||
                        ""} |`
                );
            }

            if (func.def.exceptions) {
                console.log("");
                console.log("| Throws | When |");
                console.log("| ---- | ---- |");
                func.def.exceptions.forEach(ex => {
                    console.log(
                        `| \`${(ex.type && typeToMarkdown(ex.type)) ||
                            "Error"}\` | ${ex.description || ""} |`
                    );
                });
            }

            // XXX: Other?
            console.log("");
        });
    });
};

function typeToMarkdown(type) {
    if (!type) {
        return "";
    }
    if (!type.names || type.names.length !== 1) {
        throw new Error(
            `don't know how to handle multiply-named types: ${JSON.stringify(
                type.names
            )}`
        );
    }

    return `\`${type.names[0]}\``;
}

function buildHeirarchy(taffyData) {
    const data = {
        contents: {}
    };
    taffyData().each(doclet => {
        const longname = doclet.longname;
        const namepath = longname.split(/[#.~]/g);
        const obj = namepath.reduce((parent, name) => {
            parent.contents[name] = parent.contents[name] || { contents: {} };
            return parent.contents[name];
        }, data);
        if (obj.def && !obj.def.undocumented) {
            if (doclet.undocumented) {
                return;
            }
            throw new Error(
                `Duplicate member: ${longname}:\n    ${JSON.stringify(
                    obj.def
                )}\n    ${JSON.stringify(doclet)}`
            );
        }
        obj.def = { ...doclet };
    });
    return data;
}
