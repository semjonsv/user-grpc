const { exec } = require("child_process");
const path = require("path");

const PROTO_DIR = path.join(__dirname, "../protos");
const PB_OUT = path.join(__dirname, "../pb");

const command = [
    `--grpc_out="grpc_js:${PB_OUT}" `,
    `--js_out="import_style=commonjs,binary:${PB_OUT}" `,
    `--ts_out="grpc_js:${PB_OUT}" `,
    `--proto_path ${PROTO_DIR} ${PROTO_DIR}/*.proto`,
];

const dir = exec(`npx grpc_tools_node_protoc ${command.join(" ")}`);

dir.stdout.on("data", (data) => {
 console.log(data);
});

dir.stderr.on("data", (data) => {
 console.log("Error: " + data);
});

dir.on("close", (code) => {
 console.log("Process exit code: " + code);
});
