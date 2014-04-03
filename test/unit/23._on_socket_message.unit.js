describe("The _on_socket_message private method", function () {

	describe("gets called with an object having a data property (a string) as first argument and", function () {

		it("should do nothing if data === {\"server_id\":\"0\"}", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var INIT_DDP_MESSAGE = "{\"server_id\":\"0\"}";
			var obj = {
				data: INIT_DDP_MESSAGE
			};
			sinon.spy(JSON, "parse");
			ddp._on_socket_message(obj);
			JSON.parse.callCount.should.equal(0);
			JSON.parse.restore();
		});

		it("if EJSON is available, should try to parse data with EJSON.parse", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var obj = {
				data: ""
			};
			GLB.EJSON = {
				parse: sinon.spy()
			};
			sinon.stub(console, "warn");
			ddp._on_socket_message(obj);
			EJSON.parse.calledWith(obj.data).should.be.true;
			delete GLB.EJSON;
			console.warn.restore();
		});

		it("if EJSON is not available, should try to parse data with JSON.parse", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var obj = {
				data: "{}"
			};
			sinon.spy(JSON, "parse");
			sinon.stub(console, "warn");
			ddp._on_socket_message(obj);
			JSON.parse.calledWith(obj.data).should.be.true;
			JSON.parse.restore();
			console.warn.restore();
		});

		it("if EJSON is available, should console.warn the user if data does not parse with EJSON", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var obj = {
				data: "{ ] not_JSON"
			};
			GLB.EJSON = {
				parse: function () {
					throw new Error();
				}
			};
			sinon.stub(console, "warn");
			ddp._on_socket_message(obj);
			console.warn.callCount.should.equal(2);
			console.warn.restore();
			delete GLB.EJSON;
		});

		it("if EJSON is not available, should console.warn the user if data does not parse with JSON", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var obj = {
				data: "{ ] not_JSON"
			};
			sinon.stub(console, "warn");
			ddp._on_socket_message(obj);
			console.warn.callCount.should.equal(2);
			console.warn.restore();
		});

		it("should console.warn the user if data.msg is not a DDP server message", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var obj = {
				data: JSON.stringify({
					msg: "socket_open"
				})
			};
			sinon.stub(console, "warn");
			ddp._on_socket_message(obj);
			console.warn.callCount.should.equal(2);
			console.warn.restore();
		});

		it("should call the DDP[\"_on_\" + data.msg] method, passing the parsed data as first argument", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var data = {
				msg: "added"
			};
			var obj = {
				data: JSON.stringify(data)
			};
			ddp._on_added = sinon.spy();
			ddp._on_socket_message(obj);
			ddp._on_added.calledWith(data).should.be.true;
		});

	});

});
