describe("The _on_nosub private method", function () {

	describe("receives as only argument an object containing the properties id and error, and", function () {

		describe("if _onReadyCallbacks[id] exists", function () {

			it("should call it with error as first argument", function () {
				var ddp = new DDP("", SockJS, true);
				var obj = {
					id: "0",
					error: {}
				};
				var cb = sinon.spy();
				ddp._onReadyCallbacks[0] = cb;
				ddp._on_nosub(obj);
				cb.calledWith(obj.error).should.be.true;
			});

			it("should delete that reference to the function after calling it", function () {
				var ddp = new DDP("", SockJS, true);
				var obj = {
					id: "0",
					error: {}
				};
				var cb = sinon.spy();
				ddp._onReadyCallbacks[0] = cb;
				ddp._on_nosub(obj);
				cb.calledWith(obj.error).should.be.true;
				_.isUndefined(ddp._onReadyCallbacks[0]).should.be.true;
			});

		});

		describe("if _onReadyCallbacks[id] doesn't exist", function () {

			it("should throw an error", function () {
				var ddp = new DDP("", SockJS, true);
				var obj = {
					id: "0",
					error: {}
				};
				(function () {
					ddp._on_nosub(obj);
				}).should.throw(obj.error);
			});

		});

	});

});
