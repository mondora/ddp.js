describe("The _on_result private method", function () {

	describe("receives as only argument an object containing the properties id, error, result and", function () {

		describe("if _onResultCallbacks[id] exists", function () {

			it("should call it, passing error and result as first and second arguments respectively", function () {
				var ddp = new DDP(optionsDontAutoconnect);
				var obj = {
					id: "0",
					error: {},
					result: {}
				};
				var cb = sinon.spy();
				ddp._onResultCallbacks[0] = cb;
				ddp._on_result(obj);
				cb.calledWith(obj.error, obj.result).should.be.true;
			});

			it("should delete that reference to the function after calling it", function () {
				var ddp = new DDP(optionsDontAutoconnect);
				var obj = {
					id: "0",
					error: {},
					result: {}
				};
				var cb = sinon.spy();
				ddp._onResultCallbacks[0] = cb;
				ddp._on_result(obj);
				_.isUndefined(ddp._onResultCallbacks[0]).should.be.true;
			});

			it("and if error is truthy, should delete the _onUpdatedCallbacks[id] after calling _onResultCallbacks[id]", function () {
				var ddp = new DDP(optionsDontAutoconnect);
				var obj = {
					id: "0",
					error: {},
					result: {}
				};
				var cb = sinon.spy();
				ddp._onResultCallbacks[0] = cb;
				ddp._onUpdatedCallbacks[0] = cb;
				ddp._on_result(obj);
				_.isUndefined(ddp._onUpdatedCallbacks[0]).should.be.true;
			});

		});

		describe("if _onResultCallbacks[id] doesn't exist", function () {

			it("should not throw an error if error is falsy", function () {
				var ddp = new DDP(optionsDontAutoconnect);
				var obj = {
					id: "0",
					result: {}
				};
				(function () {
					ddp._on_result(obj);
				}).should.not.throw();
			});

			it("should throw an error if error is truthy", function () {
				var ddp = new DDP(optionsDontAutoconnect);
				var obj = {
					id: "0",
					error: {}
				};
				(function () {
					ddp._on_result(obj);
				}).should.throw(obj.error);
			});

			it("should delete the _onUpdatedCallbacks[id] if error is truthy", function () {
				var ddp = new DDP(optionsDontAutoconnect);
				var obj = {
					id: "0",
					error: {},
					result: {}
				};
				ddp._onUpdatedCallbacks[0] = _.noop;
				(function () {
					ddp._on_result(obj);
				}).should.throw(obj.error);
				_.isUndefined(ddp._onUpdatedCallbacks[0]).should.be.true;
			});

		});

	});

});
